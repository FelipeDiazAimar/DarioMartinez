const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, 'revertir_nombres_toners.sql'), 'utf8');
  const updates = sql.match(/UPDATE articulos SET[\s\S]*?WHERE linea = '[^']*' AND rubro = '[^']*' AND codigo = '[^']*';/g);
  console.log('UPDATEs encontrados: ' + updates.length);

  const conn = await mysql.createConnection({
    host: 'SERVIDOR-DM', port: 3306,
    user: 'infocor', password: 'Sistema',
    database: 'gv6dariomartinez'
  });
  await conn.execute('SET NAMES utf8mb4');

  let ok = 0, err = 0, affected = 0;
  for (let i = 0; i < updates.length; i++) {
    try {
      const [result] = await conn.execute(updates[i]);
      affected += result.affectedRows;
      ok++;
    } catch (e) {
      err++;
      console.error('ERROR [' + (i + 1) + ']: ' + e.message);
    }
  }
  await conn.end();
  console.log('=== RESULTADO ===');
  console.log('Exitosos: ' + ok);
  console.log('Errores: ' + err);
  console.log('Filas afectadas: ' + affected);
})().catch(e => { console.error('FATAL: ' + e.message); process.exit(1); });
