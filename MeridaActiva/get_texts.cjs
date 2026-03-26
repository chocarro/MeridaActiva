const fs = require('fs');

const url = 'https://dxciyspuzmmkigevlavp.supabase.co/rest/v1';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Y2l5c3B1em1ta2lnZXZsYXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Njc5MjUsImV4cCI6MjA3OTA0MzkyNX0.zNFLv1jKrXkFHDlzGTFicJh4DRCXlFl2TebupP7cn80';

async function fetchAll() {
  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  };

  const resLugares = await fetch(`${url}/lugares?select=*`, { headers });
  const lugares = await resLugares.json();
  fs.writeFileSync('data_lugares.json', JSON.stringify(lugares, null, 2));
  console.log(`Lugares fetched: ${lugares.length}`);

  const resEventos = await fetch(`${url}/eventos?select=*`, { headers });
  const eventos = await resEventos.json();
  fs.writeFileSync('data_eventos.json', JSON.stringify(eventos, null, 2));
  console.log(`Eventos fetched: ${eventos.length}`);
}

fetchAll().catch(console.error);
