const fs = require('fs');

const url = 'https://dxciyspuzmmkigevlavp.supabase.co/rest/v1';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Y2l5c3B1em1ta2lnZXZsYXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Njc5MjUsImV4cCI6MjA3OTA0MzkyNX0.zNFLv1jKrXkFHDlzGTFicJh4DRCXlFl2TebupP7cn80';

async function update() {
  const lugares = JSON.parse(fs.readFileSync('data_lugares.json'));
  let count = 0;
  for (const l of lugares) {
    if (l.nombre_es && l.nombre_es !== l.nombre) {
      count++;
      console.log(`Updating ${l.nombre} -> ${l.nombre_es}`);
      
      const payload = {
        nombre: l.nombre_es,
        descripcion: l.descripcion_es
      };
      
      const res = await fetch(`${url}/lugares?id=eq.${l.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
         console.error(`Failed to update ${l.id}: ${res.statusText}`);
      }
    }
  }
  console.log(`Updated ${count} lugares!`);
}

update().catch(console.error);
