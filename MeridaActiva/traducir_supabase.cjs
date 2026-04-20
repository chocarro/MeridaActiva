// traducir_supabase.cjs
// Actualiza todos los registros de lugares que tienen nombre/descripción en inglés
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dxciyspuzmmkigevlavp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Y2l5c3B1em1ta2lnZXZsYXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Njc5MjUsImV4cCI6MjA3OTA0MzkyNX0.zNFLv1jKrXkFHDlzGTFicJh4DRCXlFl2TebupP7cn80'
);

// ── Traducciones: [nombre_en_inglés, nombre_es, descripcion_es] ──
const TRADUCCIONES_LUGARES = [
  [
    'Santiago Convent',
    'Convento de Santiago',
    'El Convento de Santiago es un edificio de gran importancia histórica que albergó la sede de la Orden de Santiago durante siglos. Hoy en día, tras su restauración, acoge exposiciones temporales y eventos culturales en el corazón de Mérida.'
  ],
  [
    'Church of El Carmen',
    'Iglesia del Carmen',
    'La Iglesia del Carmen es uno de los templos más singulares de Mérida, con una llamativa fachada barroca que destaca en el paisaje urbano del casco histórico. Actualmente se utiliza como sala de exposiciones y espacio cultural.'
  ],
  [
    'Palace of the Mendoza',
    'Palacio de los Mendoza',
    'El Palacio de los Mendoza es uno de los edificios civiles más importantes de Mérida del período bajomedieval tardío. Su arquitectura refleja el esplendor de la nobleza extremeña en los siglos XV y XVI.'
  ],
  [
    'Proserpina Reservoir',
    'Embalse de Proserpina',
    'Uno de los embalses romanos mejor conservados del mundo, construido entre los siglos I y II d.C. También es un área recreativa muy frecuentada, con zonas de baño, picnic y actividades náuticas en verano.'
  ],
  [
    'Cornalvo Reservoir',
    'Embalse de Cornalvo',
    'Notable obra de ingeniería hidráulica romana a 17 km de Mérida, cuya presa del siglo I-II d.C. sigue en uso hoy en día. Rodeado por el Parque Natural de Cornalvo, es un entorno de gran valor ecológico y paisajístico.'
  ],
  [
    'Visigoth Collection',
    'Colección Visigoda',
    'Considerada una de las colecciones visigodas más importantes del mundo, alojada en la antigua iglesia de Santa Clara. Incluye capiteles, relieves y piezas únicas que atestiguan el esplendor del arte visigodo en Hispania.'
  ],
  [
    'Alcazaba Cultural Centre',
    'Centro Cultural Alcazaba',
    'El Centro Cultural Alcazaba es el principal espacio cultural del Ayuntamiento de Mérida, acogiendo exposiciones, conciertos, teatro y todo tipo de actividades para la ciudadanía durante todo el año.'
  ],
  [
    'A de Arco',
    'A de Arco',
    'Uno de los restaurantes más premiados de Mérida, con menciones Michelin y Repsol. Situado junto al Arco de Trajano, ofrece una propuesta gastronómica de alto nivel basada en el producto extremeño de máxima calidad.'
  ],
  [
    'Sybarit Gastroshop',
    'Sybarit Gastroshop',
    'Restaurante y tienda gourmet frente al Arco de Trajano con una agradable terraza a la sombra. Cocina creativa con productos locales seleccionados y una cuidada carta de vinos extremeños.'
  ],
  [
    'Agallas Gastro Food',
    'Agallas Gastro Food',
    'Restaurante de moda con cocina de fusión de autor a precios sorprendentemente asequibles. Samosas, tacos, bocadillos gourmet y raciones que fusionan sabores internacionales con el producto local extremeño.'
  ],
  [
    'Vaova Gastro',
    'Vaova Gastro',
    'Restaurante de cocina contemporánea que combina la tradición extremeña con influencias asiáticas. Imprescindible: sus gyozas con relleno de cerdo ibérico y su versión del arroz con leche extremeño.'
  ],
  [
    "Mérida Bullring",
    'Plaza de Toros de Mérida',
    'La Plaza de Toros de Mérida, construida a finales del siglo XIX, acoge la temporada taurina y también eventos culturales. Destaca su singular arquitectura de ladrillo y su aforo para varios miles de espectadores.'
  ],
  [
    'Conce.pto',
    'Conce.pto',
    'La gran apertura gastronómica de 2025 en Mérida. El chef Samuel López, formado en Atrio y Martín Berasategui, propone una cocina de autor comprometida con el producto extremeño de temporada en un entorno de diseño contemporáneo.'
  ],
  [
    'El Puchero de la Nieta',
    'El Puchero de la Nieta',
    'Uno de los restaurantes más queridos para disfrutar de auténtica cocina extremeña. Menú del día por 14€. Imprescindible: el puchero extremeño, el jamón ibérico de bellota y los postres caseros de la abuela.'
  ],
  [
    'Tuétano',
    'Tuétano',
    'El único restaurante de Mérida con mención Michelin. Parrilla contemporánea donde las brasas y la carne ibérica extremeña son las protagonistas absolutas, acompañadas de una excelente selección de la D.O. Ribera del Guadiana.'
  ],
  [
    'Mesón El Lebrel',
    'Mesón El Lebrel',
    'Un imprescindible para la cocina extremeña más auténtica. Tres generaciones de cocina tradicional con platos como las migas extremeñas, el cordero frito y el gazpacho extremeño elaborados con recetas de siempre.'
  ],
  [
    'El Bar Old School Food',
    'El Bar Old School Food',
    'Experiencia gastronómica única en Mérida: máximo 14 comensales en barra, menú degustación cerrado que cambia semanalmente según el mercado. Reserva imprescindible con semanas de antelación.'
  ],
  [
    'Rex Numintor',
    'Rex Numintor',
    'Uno de los mejores restaurantes de Mérida, antiguo Plato Michelin. Cocina tradicional extremeña con matiz moderno, famoso por sus carnes ibéricas a la brasa y su extensa bodega de vinos de la región.'
  ],
  [
    'Natura Gastrotapas',
    'Natura Gastrotapas',
    'Restaurante de tapas y raciones para compartir con menú fijo y especialidades del día. Cocina creativa con producto de temporada a precios razonables en el centro histórico de Mérida.'
  ],
  [
    'Gastro Dehesa — Dehesa Museum',
    'Gastro Dehesa — Museo de la Dehesa',
    'Sendero de 1,5 km por la dehesa extremeña con paneles explicativos sobre el ecosistema y la cultura ibérica. Al final, cata de productos de la propia finca: jamón ibérico de bellota, queso y vinos de la tierra.'
  ],
  [
    'Victorian Maze — Roman Ornamental Garden',
    'Laberinto Victoriano — Jardín Ornamental Romano',
    'El laberinto victoriano más grande de España, ubicado en una finca inspirada en los jardines ornamentales romanos cerca de Mérida. Más de 2.000 metros de senderos entre más de 3.000 cipreses centenarios.'
  ],
  [
    'Cornalvo Natural Park',
    'Parque Natural de Cornalvo',
    'Parque Natural a 18 km de Mérida con bosques de encinas y alcornoques. Hogar de 155 especies de aves, entre ellas la cigüeña negra. Rutas de senderismo que combinan naturaleza y patrimonio hidráulico romano.'
  ],
  [
    'Valdealto — Winery and Wine Tourism',
    'Valdealto — Bodega y Enoturismo',
    'Bodega única situada en la Sierra de la Moneda, rodeada de bosque mediterráneo donde nidifican águilas reales. Visitas guiadas con cata de vinos de la D.O. Ribera del Guadiana con vistas privilegiadas al entorno natural.'
  ],
  [
    'Guided Tours of Mérida',
    'Visitas Guiadas de Mérida',
    'La Oficina de Turismo de Mérida organiza visitas guiadas oficiales al conjunto monumental Patrimonio de la Humanidad UNESCO, en español, inglés y francés. Itinerarios de 2 horas con guías turísticos titulados.'
  ],
  [
    'Hot Air Balloon Flights over Mérida',
    'Vuelos en Globo sobre Mérida',
    'Una experiencia única para descubrir Mérida desde el aire. Vuelos seguros aptos para todas las edades, con vistas al Teatro Romano, el Puente Romano y los embalses de Proserpina y Cornalvo al amanecer.'
  ],
  [
    'Basilica of Santa Eulalia',
    'Basílica de Santa Eulalia',
    'Iglesia paleocristiana del siglo IV dedicada a la santa patrona de Mérida, construida sobre un templo romano. En su interior se puede visitar la cripta arqueológica con restos de distintas épocas históricas superpuestas.'
  ],
  [
    'Parador of Mérida — Chapel Hall',
    'Parador de Mérida — Sala Capitular',
    'Sala histórica del Parador de Mérida, instalado en el antiguo convento de la Orden de Santiago. Un espacio de gran belleza arquitectónica que acoge eventos privados, presentaciones y actos culturales de prestigio.'
  ],
  [
    'José María Lozano Municipal Velodrome',
    'Velódromo Municipal José María Lozano',
    'Moderno velódromo cubierto en Mérida, sede de competiciones regionales y nacionales de ciclismo en pista. También cuenta con horarios de uso público para aficionados y practicantes de ciclismo de todos los niveles.'
  ],
  [
    'Arab Alcazaba of Mérida',
    'Alcazaba Árabe de Mérida',
    'Fortaleza árabe del siglo IX construida sobre restos romanos y visigodos, uno de los monumentos más singulares de Mérida. Desde sus murallas se obtienen vistas privilegiadas al Puente Romano y el río Guadiana.'
  ],
  [
    'Pontezuelas Square',
    'Plaza de las Pontezuelas',
    'Animada plaza en el barrio de San Lázaro, lugar habitual de conciertos al aire libre y eventos populares en Mérida. Rodeada de bares y terrazas con mucho ambiente local, especialmente en verano.'
  ],
  [
    'Mérida Fairgrounds',
    'Recinto Ferial de Mérida',
    'Gran recinto ferial que acoge la Feria y Fiestas de Mérida cada mes de septiembre, además de ferias temáticas, exposiciones comerciales y eventos deportivos a lo largo del año.'
  ],
  [
    'Juan Pablo Forner Municipal Library',
    'Biblioteca Municipal Juan Pablo Forner',
    'Principal biblioteca pública de Mérida, con una amplia colección de libros, prensa y recursos digitales. Ofrece una programación cultural continua con talleres, clubs de lectura y actividades para todas las edades.'
  ],
  [
    'El Economato Youth Centre',
    'Centro Joven El Economato',
    'Espacio de ocio juvenil gestionado por el Ayuntamiento de Mérida, con talleres de formación, sala de ensayos para grupos musicales, espacios de coworking y actividades de encuentro para jóvenes de la ciudad.'
  ],
  [
    'La Antigua Cultural Centre',
    'Centro Cultural La Antigua',
    'Centro cultural instalado en un histórico edificio rehabilitado en el centro de Mérida, con sala de exposiciones permanentes y temporales, así como espacios para actividades culturales y de formación ciudadana.'
  ],
  [
    'Guadiana Island',
    'Isla del Guadiana',
    'Isla fluvial formada por el Guadiana a su paso por Mérida, escenario de recreaciones históricas y festivales al aire libre. Especialmente animada durante el Festival Internacional de Teatro Clásico de verano.'
  ],
  [
    'Roman Road — Via de la Plata',
    'Calzada Romana — Vía de la Plata',
    'Tramo bien conservado de la calzada romana original que unía Augusta Emerita con Asturica Augusta. Aún se aprecian las losas originales, los milarios que señalaban las distancias y los canales de drenaje laterales.'
  ],
  [
    'Mérida Archaeological Complex',
    'Conjunto Arqueológico de Mérida',
    'Patrimonio de la Humanidad UNESCO desde 1993, engloba los principales monumentos romanos de la ciudad: Teatro Romano, Anfiteatro, Casa del Mitreo, Columbarios y Circo Romano. Una visita imprescindible en Mérida.'
  ],
  [
    'Amphitheatre House — Mosaics',
    'Casa del Anfiteatro — Mosaicos',
    'Casa romana con espectaculares mosaicos del siglo III d.C., situada junto al Anfiteatro Romano. Una ventana única a la vida cotidiana y el arte decorativo de los habitantes de Augusta Emerita en época imperial.'
  ],
  [
    'Pastelería Artesanos Roco',
    'Pastelería Artesanos Roco',
    'La pastelería más emblemática e icónica de Mérida desde 1954. Imprescindible para cualquier amante de los dulces. Sus torrijas, yemas, perronillas y pasteles artesanos siguen elaborándose con recetas tradicionales extremeñas.'
  ],
  [
    'Alange Spa',
    'Balneario de Alange',
    'Situado a 17 km al sur de Mérida, el Balneario de Alange ocupa unas termas romanas del período flavio (siglo I d.C.) cuyas cúpulas y piscinas originales siguen en uso. Aguas sulfurosas con propiedades terapéuticas reconocidas.'
  ],
  [
    'River Park — Riverside Walk',
    'Parque del Río — Paseo Fluvial',
    'Paseo fluvial a orillas del Guadiana con vistas al Puente Romano y al Acueducto de los Milagros. Ideal para pasear, hacer deporte o disfrutar del atardecer sobre el río en un entorno de gran valor paisajístico.'
  ],
  [
    'Ciudad de la Infancia — Children\'s Park',
    'Ciudad de la Infancia — Parque Infantil',
    'Gran parque temático infantil en Mérida con atracciones mecánicas, áreas de juego y zonas de descanso para familias. Entrada gratuita, ideal para los más pequeños durante todo el año.'
  ],
  [
    'Carabal Winery — Wine Tourism',
    'Bodega Carabal — Enoturismo',
    'Bodega familiar cerca de Mérida que ofrece visitas guiadas con cata de vinos y maridajes con productos extremeños. Sus vinos de la D.O. Ribera del Guadiana han recibido importantes reconocimientos nacionales e internacionales.'
  ],
  [
    'Finca Los Caños',
    'Finca Los Caños',
    'Finca privada con zona de baño en río, áreas de picnic y actividades de turismo rural cerca de Mérida. Un entorno natural de gran belleza rodeado de dehesa extremeña, ideal para desconectar en familia.'
  ],
  [
    'El Prado Civic Centre',
    'Centro Cívico El Prado',
    'Centro cívico del barrio de El Prado con salón de actos polivalente y programación cultural de proximidad. Punto de encuentro para asociaciones vecinales, grupos culturales y actividades comunitarias del barrio.'
  ],
  [
    "Trajan's Arch — Historic Viewpoint",
    'Arco de Trajano — Mirador Histórico',
    'Majestuoso arco de triunfo romano del siglo I d.C. ubicado en el corazón del casco histórico de Mérida. Originalmente formaba parte del recinto sagrado del foro provincial de Lusitania y hoy es símbolo de la ciudad.'
  ],
  [
    'Visigoth Art Museum — Santa Clara Church',
    'Museo de Arte Visigodo — Iglesia de Santa Clara',
    'Museo instalado en la antigua iglesia de Santa Clara, sede de la mayor colección de arte visigodo de España. Capiteles, relieves, inscripciones y piezas únicas del período entre los siglos V y VIII d.C.'
  ],
  [
    'Roman Bridge',
    'Puente Romano',
    'El Puente Romano de Mérida es el puente romano conservado más largo del mundo, con 792 metros y 60 arcos, construido en el siglo I a.C. sobre el río Guadiana. Símbolo icónico de la ciudad y Patrimonio de la Humanidad.'
  ],
];

async function main() {
  let actualizados = 0;
  let errores = 0;

  // ── Obtener todos los lugares ──
  const { data: lugares, error: fetchErr } = await supabase
    .from('lugares')
    .select('id, nombre, nombre_es');

  if (fetchErr) {
    console.error('Error al obtener lugares:', fetchErr.message);
    return;
  }

  console.log(`Total lugares en BD: ${lugares.length}\n`);

  for (const [nombreEN, nombreES, descripcionES] of TRADUCCIONES_LUGARES) {
    // Buscar por nombre exacto (puede estar en nombre o nombre_es)
    const lugar = lugares.find(
      (l) => l.nombre === nombreEN || l.nombre_es === nombreEN
    );

    if (!lugar) {
      console.log(`⚠️  No encontrado: "${nombreEN}"`);
      continue;
    }

    const { error } = await supabase
      .from('lugares')
      .update({
        nombre: nombreES,
        nombre_es: nombreES,
        descripcion: descripcionES,
        descripcion_es: descripcionES,
      })
      .eq('id', lugar.id);

    if (error) {
      console.error(`❌ Error actualizando "${nombreEN}":`, error.message);
      errores++;
    } else {
      console.log(`✅ Actualizado: "${nombreEN}" → "${nombreES}"`);
      actualizados++;
    }
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`Actualizados: ${actualizados} | Errores: ${errores}`);
}

main();
