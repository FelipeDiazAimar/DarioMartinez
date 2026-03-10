const mysql = require('mysql2/promise');
const fs = require('fs');
(async () => {
  const conn = await mysql.createConnection({ host:'SERVIDOR-DM', port:3306, user:'infocor', password:'Sistema', database:'gv6dariomartinez', charset:'latin1' });

  // Load all originals from dump
  const dump = fs.readFileSync('DarioMartinez/docs/sql/articulos_dump.sql','utf8');
  const insertRegex = /VALUES\s*\('([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'/g;
  const byCode = {};
  let m;
  while ((m = insertRegex.exec(dump)) !== null) {
    const key = m[1] + '|' + m[2] + '|' + m[3];
    byCode[key] = { linea: m[1], rubro: m[2], codigo: m[3], desc: m[4] };
  }

  // Get all tintas from BD
  await conn.execute("SET NAMES latin1");
  const [tintas] = await conn.execute("SELECT linea, rubro, codigo, descripcion FROM articulos WHERE LOWER(descripcion) LIKE 'tinta %' OR LOWER(descripcion) LIKE 'entinta%' OR LOWER(descripcion) LIKE '%tinta r.%'");

  let reverted = 0, skipped = 0, errors = 0;
  for (const t of tintas) {
    const key = t.linea + '|' + t.rubro + '|' + t.codigo;
    const orig = byCode[key];
    if (!orig) { skipped++; continue; }
    if (orig.desc === t.descripcion) { skipped++; continue; }
    
    try {
      const [result] = await conn.execute(
        "UPDATE articulos SET descripcion = ? WHERE linea = ? AND rubro = ? AND codigo = ?",
        [orig.desc, orig.linea, orig.rubro, orig.codigo]
      );
      reverted += result.affectedRows;
    } catch(e) {
      errors++;
      console.error('ERR ' + t.codigo + ':', e.message);
    }
  }

  console.log('=== REVERSION TINTAS ===');
  console.log('Total encontradas:', tintas.length);
  console.log('Revertidas:', reverted);
  console.log('Sin cambio (ya iguales):', skipped);
  console.log('Errores:', errors);

  await conn.end();
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
