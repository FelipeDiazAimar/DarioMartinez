const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({ host:'SERVIDOR-DM', port:3306, user:'infocor', password:'Sistema', database:'gv6dariomartinez', charset:'latin1' });
  
  const [cols] = await conn.execute('SHOW COLUMNS FROM kardex');
  console.log('=== COLUMNAS KARDEX ===');
  cols.forEach(c => console.log(c.Field + ' | ' + c.Type + ' | Null=' + c.Null + ' | Default=' + c.Default));

  const [rows] = await conn.execute('SELECT * FROM kardex ORDER BY fecha DESC, movimiento DESC LIMIT 15');
  console.log('\n=== ULTIMOS 15 REGISTROS ===');
  rows.forEach(r => {
    const vals = Object.entries(r).map(([k,v]) => k + '=' + JSON.stringify(v)).join(' | ');
    console.log(vals);
  });

  const [count] = await conn.execute('SELECT COUNT(*) as total FROM kardex');
  console.log('\nTotal registros:', count[0].total);

  // Check for problematic dates
  const [badDates] = await conn.execute("SELECT DISTINCT fecha FROM kardex ORDER BY fecha DESC LIMIT 20");
  console.log('\n=== ULTIMAS 20 FECHAS DISTINTAS ===');
  badDates.forEach(r => console.log('fecha=' + JSON.stringify(r.fecha)));

  await conn.end();
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
