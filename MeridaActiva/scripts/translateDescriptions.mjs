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

const env = { ...fileEnv, ...process.env };
const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY,
);

const englishMarkers = [
  ' the ',
  ' and ',
  ' with ',
  ' for ',
  ' this ',
  ' that ',
  ' discover ',
  ' one of the ',
  ' in the ',
  ' history',
];

const replacements = [
  [/ one of the /gi, ' uno de los '],
  [/discover/gi, 'descubre'],
  [/history/gi, 'historia'],
  [/the /gi, 'el '],
  [/ and /gi, ' y '],
  [/ with /gi, ' con '],
  [/ for /gi, ' para '],
  [/ in /gi, ' en '],
  [/ from /gi, ' desde '],
  [/ of /gi, ' de '],
];

const looksEnglish = (text = '') => {
  const lower = ` ${text.toLowerCase()} `;
  return englishMarkers.some((m) => lower.includes(m));
};

const translateBasic = (text = '') => {
  let out = text;
  for (const [pattern, replacement] of replacements) {
    out = out.replace(pattern, replacement);
  }
  return out.replace(/\s{2,}/g, ' ').trim();
};

const processTable = async (table, idField, descriptionField) => {
  const { data, error } = await supabase.from(table).select(`${idField},${descriptionField}`);
  if (error) throw error;

  let updated = 0;
  for (const row of data ?? []) {
    const original = row[descriptionField] || '';
    if (!original || !looksEnglish(original)) continue;

    const translated = translateBasic(original);
    if (translated === original) continue;

    const { error: updateError } = await supabase
      .from(table)
      .update({ [descriptionField]: translated })
      .eq(idField, row[idField]);
    if (updateError) throw updateError;
    updated += 1;
  }

  return updated;
};

const run = async () => {
  const eventosUpdated = await processTable('eventos', 'id', 'descripcion');
  const lugaresUpdated = await processTable('lugares', 'id', 'descripcion_es');

  console.log(
    JSON.stringify(
      {
        eventos_descripciones_actualizadas: eventosUpdated,
        lugares_descripciones_actualizadas: lugaresUpdated,
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
