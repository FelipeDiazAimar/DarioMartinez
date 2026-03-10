const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({ host:'SERVIDOR-DM', port:3306, user:'infocor', password:'Sistema', database:'gv6dariomartinez', charset:'latin1' });

  const [cols] = await conn.execute('SHOW COLUMNS FROM precios');
  console.log('=== COLUMNAS PRECIOS ===');
  cols.forEach(c => console.log(c.Field + ' | ' + c.Type + ' | Null=' + c.Null + ' | Key=' + c.Key + ' | Default=' + c.Default));

  const [rows] = await conn.execute('SELECT * FROM precios LIMIT 10');
  console.log('\n=== PRIMEROS 10 REGISTROS ===');
  rows.forEach(r => {
    const vals = Object.entries(r).map(([k,v]) => k + '=' + JSON.stringify(v)).join(' | ');
    console.log(vals);
  });

  const [count] = await conn.execute('SELECT COUNT(*) as total FROM precios');
  console.log('\nTotal registros:', count[0].total);

  // Check indexes/keys
  const [indexes] = await conn.execute('SHOW INDEX FROM precios');
  console.log('\n=== INDICES ===');
  indexes.forEach(i => console.log(i.Key_name + ' | ' + i.Column_name + ' | Unique=' + !i.Non_unique));

  await conn.end();
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
