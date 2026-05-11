/**
 * seed_eventos_mayo2026.cjs
 * ─────────────────────────────────────────────────────────────────
 * Inserta eventos reales de merida.es/agenda en Supabase.
 * Usa upsert (ON CONFLICT DO NOTHING) para no duplicar.
 *
 * Uso:  node scripts/seed_eventos_mayo2026.cjs
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌  Faltan variables VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Coordenadas de ubicaciones frecuentes ──────────────────────
const COORDS = {
  'Teatro Romano':           { lat: 38.9174, lng: -6.3403 },
  'Teatro María Luisa':      { lat: 38.9155, lng: -6.3440 },
  'Palacio de Congresos':    { lat: 38.9097, lng: -6.3501 },
  'Museo Nacional de Arte Romano': { lat: 38.9175, lng: -6.3399 },
  'Centro Cultural Alcazaba': { lat: 38.9167, lng: -6.3430 },
  'IFEME':                   { lat: 38.9120, lng: -6.3560 },
  'Parque de las VII Sillas':{ lat: 38.9220, lng: -6.3480 },
  'Jazz Bar':                { lat: 38.9145, lng: -6.3450 },
  'Plaza de España':         { lat: 38.9152, lng: -6.3442 },
};

function coords(lugar) {
  for (const [k, v] of Object.entries(COORDS)) {
    if (lugar.includes(k)) return v;
  }
  return { lat: 38.9161, lng: -6.3437 }; // centro de Mérida
}

// ── Lista de eventos extraídos de merida.es/agenda ─────────────
const EVENTOS = [
  // ── MAYO 2026 ───────────────────────────────────────────────
  {
    titulo: 'MIT Jazz Festival Mérida 2026 — Apertura',
    descripcion: 'Ciclo de conciertos de jazz que recorre Mérida desde marzo hasta junio. Una de las propuestas musicales más esperadas del año, con artistas nacionales e internacionales.',
    fecha: '2026-05-12',
    hora: '21:00',
    ubicacion: 'Varios escenarios, Mérida',
    categoria: 'Música',
    precio: 'Consultar programa',
    imagen_url: null,
  },
  {
    titulo: 'Mérida en Danza — Gala de clausura',
    descripcion: 'Clausura del festival de danza de Mérida con espectáculo de compañías locales e invitadas. Una celebración del movimiento y la expresión artística.',
    fecha: '2026-05-16',
    hora: '20:00',
    ubicacion: 'Teatro María Luisa, Mérida',
    categoria: 'Cultural',
    precio: 'Entrada libre',
    imagen_url: null,
  },
  {
    titulo: 'Noche de los Museos 2026',
    descripcion: 'La noche internacional de los museos abre las puertas del Museo Nacional de Arte Romano de forma gratuita con actividades especiales, visitas guiadas y espectáculos.',
    fecha: '2026-05-16',
    hora: '20:00',
    ubicacion: 'Museo Nacional de Arte Romano, Mérida',
    categoria: 'Cultural',
    precio: 'Entrada gratuita',
    imagen_url: null,
  },
  {
    titulo: 'Juan Dávila: «El Imperio del Pecado»',
    descripcion: 'Espectáculo nocturno en el Teatro Romano de Mérida con el humor incisivo de Juan Dávila, dentro del ciclo cultural de primavera.',
    fecha: '2026-05-16',
    hora: '22:00',
    ubicacion: 'Teatro Romano, Mérida',
    categoria: 'Teatro',
    precio: 'Consultar taquilla',
    imagen_url: null,
  },
  {
    titulo: '7 Sillas Fest 2026 — Día 1',
    descripcion: 'Festival de música en el Parque de las VII Sillas con artistas locales y nacionales. Ambiente familiar y al aire libre, uno de los festivales de verano de referencia en Mérida.',
    fecha: '2026-05-15',
    hora: '18:00',
    ubicacion: 'Parque de las VII Sillas, Mérida',
    categoria: 'Música',
    precio: 'Consultar web del festival',
    imagen_url: null,
  },
  {
    titulo: '7 Sillas Fest 2026 — Día 2',
    descripcion: 'Segunda jornada del festival de música al aire libre en el Parque de las VII Sillas, con más artistas y actividades.',
    fecha: '2026-05-16',
    hora: '18:00',
    ubicacion: 'Parque de las VII Sillas, Mérida',
    categoria: 'Música',
    precio: 'Consultar web del festival',
    imagen_url: null,
  },
  {
    titulo: 'Pint of Science Mérida 2026 — Día 1',
    descripcion: 'Festival internacional de divulgación científica en bares. Investigadores explican sus proyectos de forma amena y accesible al público general.',
    fecha: '2026-05-18',
    hora: '19:00',
    ubicacion: 'Jazz Bar, Mérida',
    categoria: 'Cultural',
    precio: 'Entrada libre',
    imagen_url: null,
  },
  {
    titulo: 'Pint of Science Mérida 2026 — Día 2',
    descripcion: 'Segunda jornada del festival de ciencia en bares de Mérida. Charlas de investigadores en un ambiente distendido.',
    fecha: '2026-05-19',
    hora: '19:00',
    ubicacion: 'Jazz Bar, Mérida',
    categoria: 'Cultural',
    precio: 'Entrada libre',
    imagen_url: null,
  },
  {
    titulo: 'Pint of Science Mérida 2026 — Día 3',
    descripcion: 'Tercera y última jornada del festival Pint of Science en Mérida con divulgación científica en bares.',
    fecha: '2026-05-20',
    hora: '19:00',
    ubicacion: 'Jazz Bar, Mérida',
    categoria: 'Cultural',
    precio: 'Entrada libre',
    imagen_url: null,
  },
  {
    titulo: 'XVI Emerita Lvdica — Apertura',
    descripcion: 'El mayor festival de recreación histórica de Hispania vuelve a Mérida. Gladiadores, legionarios romanos, mercados y espectáculos en escenarios únicos como el Anfiteatro y el Teatro Romano.',
    fecha: '2026-05-18',
    hora: '10:00',
    ubicacion: 'Anfiteatro Romano, Mérida',
    categoria: 'Patrimonio',
    precio: 'Consultar programa oficial',
    imagen_url: null,
  },
  {
    titulo: 'XVI Emerita Lvdica — Combates de Gladiadores',
    descripcion: 'Espectáculo de recreación histórica de combates de gladiadores en el Anfiteatro Romano, el escenario más auténtico posible para este espectáculo único.',
    fecha: '2026-05-23',
    hora: '19:00',
    ubicacion: 'Anfiteatro Romano, Mérida',
    categoria: 'Patrimonio',
    precio: 'Consultar taquilla',
    imagen_url: null,
  },
  {
    titulo: 'XVI Emerita Lvdica — Clausura',
    descripcion: 'Gran desfile de clausura de Emerita Lvdica por las calles históricas de Mérida con miles de participantes en trajes romanos.',
    fecha: '2026-05-24',
    hora: '18:00',
    ubicacion: 'Casco Histórico, Mérida',
    categoria: 'Patrimonio',
    precio: 'Acceso libre al desfile',
    imagen_url: null,
  },

  // ── JUNIO 2026 ──────────────────────────────────────────────
  {
    titulo: 'Gala de los XXIX Premios Max de las Artes Escénicas',
    descripcion: 'La gala de los premios más importantes del teatro español se celebra en el Teatro Romano de Mérida. Una noche de gala única en un escenario patrimonio de la humanidad.',
    fecha: '2026-06-01',
    hora: '21:00',
    ubicacion: 'Teatro Romano, Mérida',
    categoria: 'Teatro',
    precio: 'Consultar disponibilidad',
    imagen_url: null,
  },
  {
    titulo: 'Stone & Music Festival: Sergio Dalma',
    descripcion: 'El artista Sergio Dalma actúa en el icónico Teatro Romano de Mérida dentro del festival Stone & Music, que combina música en vivo con el patrimonio histórico de la ciudad.',
    fecha: '2026-06-06',
    hora: '22:15',
    ubicacion: 'Teatro Romano, Mérida',
    categoria: 'Música',
    precio: 'Consultar precios en taquilla',
    imagen_url: null,
  },
  {
    titulo: 'MIT Jazz Festival Mérida — Concierto de verano',
    descripcion: 'Concierto del ciclo de jazz de Mérida en junio, con artistas de primer nivel internacional dentro del MIT Jazz Festival.',
    fecha: '2026-06-17',
    hora: '21:00',
    ubicacion: 'Varios escenarios, Mérida',
    categoria: 'Música',
    precio: 'Consultar programa',
    imagen_url: null,
  },
  {
    titulo: 'Stone & Music Festival: Pablo Alborán',
    descripcion: 'Pablo Alborán actúa en el Teatro Romano de Mérida en una noche mágica bajo las estrellas extremeñas, dentro del festival Stone & Music.',
    fecha: '2026-06-21',
    hora: '22:15',
    ubicacion: 'Teatro Romano, Mérida',
    categoria: 'Música',
    precio: 'Consultar precios en taquilla',
    imagen_url: null,
  },
  {
    titulo: 'Stone & Music Festival: Alan Parsons Live Project',
    descripcion: 'El legendario Alan Parsons Live Project actúa en el Teatro Romano de Mérida en una velada de rock sinfónico única.',
    fecha: '2026-06-28',
    hora: '22:15',
    ubicacion: 'Teatro Romano, Mérida',
    categoria: 'Música',
    precio: 'Consultar precios en taquilla',
    imagen_url: null,
  },

  // ── JULIO 2026 ──────────────────────────────────────────────
  {
    titulo: '72 Festival Internacional de Teatro Clásico — Spartacus',
    descripcion: 'Apertura del 72 Festival Internacional de Teatro Clásico de Mérida con la representación de Spartacus en el Teatro Romano, el más auténtico escenario para el teatro grecolatino.',
    fecha: '2026-07-03',
    hora: '22:00',
    ubicacion: 'Teatro Romano, Mérida',
    categoria: 'Teatro',
    precio: 'Desde 15€ — Consultar taquilla',
    imagen_url: null,
  },
  {
    titulo: '72 Festival Internacional de Teatro Clásico — Penélope',
    descripcion: 'Representación de Penélope en el Teatro María Luisa, dentro del 72 Festival Internacional de Teatro Clásico de Mérida.',
    fecha: '2026-07-04',
    hora: '20:00',
    ubicacion: 'Teatro María Luisa, Mérida',
    categoria: 'Teatro',
    precio: 'Consultar taquilla',
    imagen_url: null,
  },
  {
    titulo: '72 Festival Internacional de Teatro Clásico — Medea',
    descripcion: 'Una de las tragedias más poderosas del teatro griego se representa en el Teatro Romano de Mérida durante el Festival Internacional de Teatro Clásico.',
    fecha: '2026-07-11',
    hora: '22:00',
    ubicacion: 'Teatro Romano, Mérida',
    categoria: 'Teatro',
    precio: 'Desde 15€ — Consultar taquilla',
    imagen_url: null,
  },
  {
    titulo: '72 Festival Internacional de Teatro Clásico — Bacanal',
    descripcion: 'Espectáculo Bacanal en el Teatro Romano de Mérida, una producción espectacular dentro del Festival Internacional de Teatro Clásico.',
    fecha: '2026-07-22',
    hora: '22:00',
    ubicacion: 'Teatro Romano, Mérida',
    categoria: 'Teatro',
    precio: 'Desde 15€ — Consultar taquilla',
    imagen_url: null,
  },
  {
    titulo: '72 Festival Internacional de Teatro Clásico — Bacanal (2ª función)',
    descripcion: 'Segunda representación de Bacanal en el Teatro Romano de Mérida durante el Festival Internacional de Teatro Clásico.',
    fecha: '2026-07-26',
    hora: '22:00',
    ubicacion: 'Teatro Romano, Mérida',
    categoria: 'Teatro',
    precio: 'Desde 15€ — Consultar taquilla',
    imagen_url: null,
  },

  // ── AGOSTO 2026 ─────────────────────────────────────────────
  {
    titulo: '72 Festival Internacional de Teatro Clásico — Medea (reposición)',
    descripcion: 'Reposición de Medea en el Teatro Romano de Mérida durante las últimas semanas del Festival Internacional de Teatro Clásico.',
    fecha: '2026-08-01',
    hora: '22:00',
    ubicacion: 'Teatro Romano, Mérida',
    categoria: 'Teatro',
    precio: 'Desde 15€ — Consultar taquilla',
    imagen_url: null,
  },
  {
    titulo: '72 Festival Internacional de Teatro Clásico — Mio Cid',
    descripcion: 'Representación épica del Mio Cid en el Teatro Romano de Mérida, gran producción del Festival Internacional de Teatro Clásico en su recta final.',
    fecha: '2026-08-19',
    hora: '22:00',
    ubicacion: 'Teatro Romano, Mérida',
    categoria: 'Teatro',
    precio: 'Desde 15€ — Consultar taquilla',
    imagen_url: null,
  },
  {
    titulo: '72 Festival Internacional de Teatro Clásico — Mio Cid (última función)',
    descripcion: 'Última representación de Mio Cid, clausurando el 72 Festival Internacional de Teatro Clásico de Mérida.',
    fecha: '2026-08-23',
    hora: '22:00',
    ubicacion: 'Teatro Romano, Mérida',
    categoria: 'Teatro',
    precio: 'Desde 15€ — Consultar taquilla',
    imagen_url: null,
  },
  {
    titulo: '72 Festival Internacional de Teatro Clásico — Clausura',
    descripcion: 'Cierre oficial del 72 Festival Internacional de Teatro Clásico de Mérida con gala de clausura en el Teatro Romano.',
    fecha: '2026-08-30',
    hora: '21:00',
    ubicacion: 'Teatro Romano, Mérida',
    categoria: 'Teatro',
    precio: 'Consultar taquilla',
    imagen_url: null,
  },

  // ── SEPTIEMBRE 2026 ─────────────────────────────────────────
  {
    titulo: 'God Save The Queen — Tributo oficial',
    descripcion: 'El mejor tributo a Queen actúa en Mérida con el espectáculo God Save The Queen, reproduciendo en directo los grandes éxitos de la banda británica con producción de gran formato.',
    fecha: '2026-09-19',
    hora: '21:00',
    ubicacion: 'Palacio de Congresos, Mérida',
    categoria: 'Música',
    precio: 'Consultar taquilla',
    imagen_url: null,
  },

  // ── OCTUBRE 2026 ────────────────────────────────────────────
  {
    titulo: 'Stone & Music Festival: Ángel Martín — «Somos Monos»',
    descripcion: 'El cómico y divulgador científico Ángel Martín presenta su espectáculo «Somos Monos» en el Palacio de Congresos de Mérida.',
    fecha: '2026-10-03',
    hora: '20:00',
    ubicacion: 'Palacio de Congresos, Mérida',
    categoria: 'Cultural',
    precio: 'Consultar taquilla',
    imagen_url: null,
  },
  {
    titulo: '«El Mago de Oz», el musical',
    descripcion: 'La magia del musical «El Mago de Oz» llega al Palacio de Congresos de Mérida. Un espectáculo para toda la familia con coloridos decorados y canciones míticas.',
    fecha: '2026-10-10',
    hora: '17:00',
    ubicacion: 'Palacio de Congresos, Mérida',
    categoria: 'Infantil',
    precio: 'Consultar precios familiares',
    imagen_url: null,
  },
  {
    titulo: 'Stone & Music Festival: Raphael',
    descripcion: 'El legendario Raphael, uno de los artistas más longevos y queridos de la música española, actúa en el Teatro Romano de Mérida en una noche de historia.',
    fecha: '2026-10-24',
    hora: '21:00',
    ubicacion: 'Teatro Romano, Mérida',
    categoria: 'Música',
    precio: 'Consultar taquilla',
    imagen_url: null,
  },

  // ── NOVIEMBRE 2026 ──────────────────────────────────────────
  {
    titulo: 'Ara Malikian en Mérida',
    descripcion: 'El virtuoso violinista Ara Malikian vuelve a deleitar al público de Mérida con su inconfundible mezcla de estilos, pasión y virtuosismo en el Palacio de Congresos.',
    fecha: '2026-11-26',
    hora: '21:00',
    ubicacion: 'Palacio de Congresos, Mérida',
    categoria: 'Música',
    precio: 'Consultar taquilla',
    imagen_url: null,
  },

  // ── DICIEMBRE 2026 ──────────────────────────────────────────
  {
    titulo: 'Stone & Music Festival: Raphael (Teatro Romano)',
    descripcion: 'Raphael cierra el Stone & Music Festival con una actuación histórica en el Teatro Romano de Mérida, el escenario más emblemático de la ciudad.',
    fecha: '2026-12-12',
    hora: '20:00',
    ubicacion: 'Teatro Romano, Mérida',
    categoria: 'Música',
    precio: 'Consultar taquilla',
    imagen_url: null,
  },
  {
    titulo: '«Zootropolis», el musical navideño',
    descripcion: 'El popular universo de Zootropolis llega en formato musical al Palacio de Congresos de Mérida para las fiestas navideñas. Espectáculo ideal para toda la familia.',
    fecha: '2026-12-27',
    hora: '12:00',
    ubicacion: 'Palacio de Congresos, Mérida',
    categoria: 'Infantil',
    precio: 'Consultar precios familiares',
    imagen_url: null,
  },

  // ── EVENTOS ADICIONALES DE MAYO ─────────────────────────────
  {
    titulo: 'Feria del Libro de Mérida — XLV edición',
    descripcion: 'La 45ª edición de la Feria del Libro de Mérida reúne a editores, autores y lectores con actividades, presentaciones y firma de libros en la Plaza de España.',
    fecha: '2026-05-22',
    hora: '11:00',
    ubicacion: 'Plaza de España, Mérida',
    categoria: 'Cultural',
    precio: 'Entrada libre',
    imagen_url: null,
  },
  {
    titulo: 'Talleres Infantiles de Verano — Inscripción abierta',
    descripcion: 'Inicio de los talleres infantiles del Ayuntamiento de Mérida. Actividades creativas, deportivas y culturales para niños de 6 a 14 años durante el verano.',
    fecha: '2026-05-25',
    hora: '09:00',
    ubicacion: 'Centro de Ocio Joven El Economato, Mérida',
    categoria: 'Infantil',
    precio: 'Consultar precios municipales',
    imagen_url: null,
  },
  {
    titulo: 'Visita nocturna al Teatro Romano',
    descripcion: 'Visita guiada nocturna al Teatro Romano de Mérida. Una experiencia única bajo las estrellas para conocer la historia del monumento más icónico de la ciudad.',
    fecha: '2026-05-30',
    hora: '21:30',
    ubicacion: 'Teatro Romano, Mérida',
    categoria: 'Patrimonio',
    precio: '8€ adultos / 4€ niños',
    imagen_url: null,
  },
  {
    titulo: 'Concierto de la Banda Municipal de Mérida',
    descripcion: 'La Banda Municipal de Mérida ofrece su concierto de primavera en la Plaza de España con un programa de música clásica, pasodobles y música de película.',
    fecha: '2026-05-28',
    hora: '19:30',
    ubicacion: 'Plaza de España, Mérida',
    categoria: 'Música',
    precio: 'Entrada libre',
    imagen_url: null,
  },
  {
    titulo: 'Jornadas Gastronómicas Extremeñas',
    descripcion: 'Degustación de productos típicos extremeños: jamón ibérico, queso de la Serena, tortas extremeñas y vinos de la tierra en el centro histórico de Mérida.',
    fecha: '2026-05-31',
    hora: '11:00',
    ubicacion: 'Centro Histórico, Mérida',
    categoria: 'Gastronomía',
    precio: 'Entrada libre',
    imagen_url: null,
  },
  {
    titulo: 'Actividades Deportivas de Verano — Apertura',
    descripcion: 'Arranca el programa de actividades deportivas de verano del Ayuntamiento de Mérida: natación, padel, atletismo y más en las instalaciones municipales.',
    fecha: '2026-06-15',
    hora: '09:00',
    ubicacion: 'Instalaciones Deportivas Municipales, Mérida',
    categoria: 'Deporte',
    precio: 'Consultar tarifas municipales',
    imagen_url: null,
  },
  {
    titulo: 'Apertura Piscinas Municipales de Verano',
    descripcion: 'Apertura oficial de las piscinas municipales de Mérida para la temporada de verano. Horarios ampliados y actividades acuáticas para todas las edades.',
    fecha: '2026-06-20',
    hora: '10:00',
    ubicacion: 'Piscinas Municipales, Mérida',
    categoria: 'Deporte',
    precio: 'Consultar tarifas municipales',
    imagen_url: null,
  },
];

async function insertar() {
  console.log(`\n🏛️  MeridaActiva — Seed de ${EVENTOS.length} eventos\n`);

  // Enriquecer con coordenadas
  const rows = EVENTOS.map(ev => ({
    ...ev,
    latitud: coords(ev.ubicacion).lat,
    longitud: coords(ev.ubicacion).lng,
    animales_permitidos: false,
  }));

  // Insertar en lotes de 10
  const LOTE = 10;
  let insertados = 0;
  let omitidos = 0;

  for (let i = 0; i < rows.length; i += LOTE) {
    const lote = rows.slice(i, i + LOTE);

    // Verificar cuáles ya existen por titulo+fecha
    for (const ev of lote) {
      const { data: existente } = await supabase
        .from('eventos')
        .select('id')
        .eq('titulo', ev.titulo)
        .eq('fecha', ev.fecha)
        .maybeSingle();

      if (existente) {
        console.log(`  ⏭  Ya existe: ${ev.titulo} (${ev.fecha})`);
        omitidos++;
        continue;
      }

      const { error } = await supabase.from('eventos').insert(ev);
      if (error) {
        console.error(`  ❌ Error en "${ev.titulo}":`, error.message);
      } else {
        console.log(`  ✅ Insertado: ${ev.titulo} (${ev.fecha})`);
        insertados++;
      }
    }
  }

  console.log(`\n────────────────────────────────────`);
  console.log(`✅ Insertados: ${insertados}`);
  console.log(`⏭  Ya existían: ${omitidos}`);
  console.log(`📊 Total procesados: ${EVENTOS.length}\n`);
}

insertar().catch(console.error);
