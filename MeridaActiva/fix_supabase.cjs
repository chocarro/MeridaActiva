const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dxciyspuzmmkigevlavp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Y2l5c3B1em1ta2lnZXZsYXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Njc5MjUsImV4cCI6MjA3OTA0MzkyNX0.zNFLv1jKrXkFHDlzGTFicJh4DRCXlFl2TebupP7cn80'
);

async function main() {
  const { data: lugares, error: err1 } = await supabase.from('lugares').select('id, nombre, descripcion');
  if (err1) {
    console.error(err1);
    return;
  }
  
  console.log("LUGARES:");
  for (const l of lugares) {
    if (l.nombre.includes('Arco') || l.descripcion.match(/[a-zA-Z]/)) {
      console.log(`- ${l.nombre}`);
      console.log(`  Descripción: ${l.descripcion.slice(0, 100)}...`);
    }
  }

  const { data: eventos, error: err2 } = await supabase.from('eventos').select('id, titulo, descripcion');
  if (err2) {
    console.error(err2);
    return;
  }

  console.log("\nEVENTOS:");
  for (const e of eventos) {
    if (e.descripcion && e.descripcion.includes('The')) {
       console.log(`- ${e.titulo}`);
    }
  }
}

main();
