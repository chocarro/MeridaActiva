import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const fileEnv = Object.fromEntries(
  fs
    .readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((line) => !line.startsWith('#'))
    .map((line) => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx), line.slice(idx + 1)];
    }),
);

const env = {
  ...fileEnv,
  ...process.env,
};

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY,
);
const TODAY = new Date().toISOString().slice(0, 10);
const DEFAULT_LAT = 38.9161;
const DEFAULT_LNG = -6.3437;

const normalize = (text = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const stripHtml = (text = '') =>
  text
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeCategoria = (raw = '') => {
  const c = normalize(raw);
  if (c.includes('teatro') || c.includes('danza')) return 'Teatro';
  if (c.includes('musica') || c.includes('concierto') || c.includes('jazz') || c.includes('zarzuela')) return 'Música';
  return 'Cultural';
};

const venueText = (venue = {}) => {
  const parts = [venue.venue, venue.address, venue.city].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Mérida';
};

const geocodeCache = new Map();
async function geocodeIfNeeded(ubicacion) {
  const key = normalize(ubicacion);
  if (!key) return { latitud: DEFAULT_LAT, longitud: DEFAULT_LNG };
  if (geocodeCache.has(key)) return geocodeCache.get(key);
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(ubicacion + ', Mérida, España')}`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MeridaActivaSync/1.0 (event sync script)' },
    });
    const data = await res.json();
    if (Array.isArray(data) && data[0]) {
      const coords = { latitud: Number(data[0].lat), longitud: Number(data[0].lon) };
      geocodeCache.set(key, coords);
      return coords;
    }
  } catch {
    // fallback below
  }
  const fallback = { latitud: DEFAULT_LAT, longitud: DEFAULT_LNG };
  geocodeCache.set(key, fallback);
  return fallback;
}

async function fetchAgendaEvents() {
  const results = [];
  let nextUrl = `https://merida.es/wp-json/tribe/events/v1/events?per_page=50&start_date=${TODAY}`;

  while (nextUrl) {
    const res = await fetch(nextUrl);
    if (!res.ok) throw new Error(`No se pudo leer agenda API: ${res.status}`);
    const data = await res.json();
    const events = data.events ?? [];
    results.push(...events);
    nextUrl = data.next_rest_url || null;
  }

  return results;
}

async function buildEventsToUpsert() {
  const remoteEvents = await fetchAgendaEvents();
  const transformed = [];

  for (const ev of remoteEvents) {
    const titulo = stripHtml(ev.title || '');
    if (!titulo) continue;

    const fecha = (ev.start_date || '').slice(0, 10);
    if (!fecha || fecha < TODAY) continue;

    const hora = (ev.start_date || '').slice(11, 16) || null;
    const descripcion = stripHtml(ev.description || ev.excerpt || '');
    const ubicacion = venueText(ev.venue || {});
    const categoriaRaw = (ev.categories || []).map((c) => c.name).join(', ') || 'Cultural';
    const categoria = normalizeCategoria(categoriaRaw);
    const precio = stripHtml(ev.cost || '') || 'Consultar';
    const imagenUrl = ev.image?.url || null;
    const enlace = ev.url || ev.website || null;

    const hasVenueCoords = ev.venue && ev.venue.latitude && ev.venue.longitude;
    const coords = hasVenueCoords
      ? { latitud: Number(ev.venue.latitude), longitud: Number(ev.venue.longitude) }
      : await geocodeIfNeeded(ubicacion);

    transformed.push({
      titulo,
      descripcion,
      fecha,
      hora,
      ubicacion,
      precio,
      categoria,
      imagen_url: imagenUrl,
      enlace_externo: enlace,
      latitud: coords.latitud,
      longitud: coords.longitud,
    });
  }

  const unique = new Map();
  for (const ev of transformed) {
    const key = `${normalize(ev.titulo)}|${ev.fecha}`;
    if (!unique.has(key)) unique.set(key, ev);
  }
  return [...unique.values()];
}

const run = async () => {
  const remoteEvents = await buildEventsToUpsert();

  const { data: allEvents, error: readError } = await supabase
    .from('eventos')
    .select('id,titulo,fecha,ubicacion,latitud,longitud');
  if (readError) throw readError;

  for (const ev of allEvents ?? []) {
    if (ev.ubicacion && ev.latitud != null && ev.longitud != null) {
      geocodeCache.set(normalize(ev.ubicacion), {
        latitud: ev.latitud,
        longitud: ev.longitud,
      });
    }
  }

  const oldIds = (allEvents ?? []).filter((ev) => ev.fecha && ev.fecha < TODAY).map((ev) => ev.id);
  if (oldIds.length > 0) {
    const { error } = await supabase.from('eventos').delete().in('id', oldIds);
    if (error) throw error;
  }

  const { data: currentEvents, error: currentError } = await supabase
    .from('eventos')
    .select('id,titulo,fecha')
    .gte('fecha', TODAY)
    .order('fecha', { ascending: true });
  if (currentError) throw currentError;

  const seen = new Map();
  const duplicateIds = [];
  for (const ev of currentEvents ?? []) {
    const key = `${normalize(ev.titulo)}|${ev.fecha ?? ''}`;
    if (seen.has(key)) duplicateIds.push(ev.id);
    else seen.set(key, ev.id);
  }

  if (duplicateIds.length > 0) {
    const { error } = await supabase.from('eventos').delete().in('id', duplicateIds);
    if (error) throw error;
  }

  let inserted = 0;
  let updated = 0;

  for (const ev of remoteEvents) {
    const { data: existing, error: existingError } = await supabase
      .from('eventos')
      .select('id')
      .ilike('titulo', ev.titulo)
      .eq('fecha', ev.fecha)
      .maybeSingle();
    if (existingError) throw existingError;

    if (existing?.id) {
      const { error } = await supabase.from('eventos').update(ev).eq('id', existing.id);
      if (error) throw error;
      updated += 1;
    } else {
      const { error } = await supabase.from('eventos').insert([ev]);
      if (error) throw error;
      inserted += 1;
    }
  }

  const { count, error: countError } = await supabase
    .from('eventos')
    .select('id', { count: 'exact', head: true })
    .gte('fecha', TODAY);
  if (countError) throw countError;

  console.log(
    JSON.stringify(
      {
        deleted_old: oldIds.length,
        deleted_duplicates: duplicateIds.length,
        fetched_from_agenda: remoteEvents.length,
        upserted_inserted: inserted,
        upserted_updated: updated,
        total_current: count ?? 0,
      },
      null,
      2,
    ),
  );
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
