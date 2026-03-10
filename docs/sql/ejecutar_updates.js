/**
 * Ejecuta todos los archivos update_lote_XX.sql en orden contra la BD.
 * Usa la misma librería mysql2 del proyecto.
 * 
 * Uso: node ejecutar_updates.js
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = {
  host: 'SERVIDOR-DM',
  port: 3306,
  user: 'infocor',
  password: 'Sistema',
  database: 'gv6dariomartinez',
  multipleStatements: true,
  charset: 'utf8mb4'
};

async function run() {
  const sqlDir = __dirname;
  const files = fs.readdirSync(sqlDir)
    .filter(f => f.match(/^update_lote_\d+\.sql$/))
    .sort();

  console.log(`Encontrados ${files.length} archivos SQL.`);
  console.log(`Conectando a ${config.host}/${config.database}...`);

  const conn = await mysql.createConnection(config);
  await conn.execute('SET NAMES utf8mb4');
  console.log('Conectado. Charset: utf8mb4\n');

  let totalOk = 0;
  let totalErr = 0;
  let totalAffected = 0;
  const errors = [];

  for (const file of files) {
    const filepath = path.join(sqlDir, file);
    const content = fs.readFileSync(filepath, 'utf8').replace(/^\uFEFF/, '');

    // Extraer sentencias UPDATE individuales usando regex
    const updateRegex = /UPDATE articulos SET[\s\S]*?WHERE linea = '[^']*' AND rubro = '[^']*' AND codigo = '[^']*';/g;
    const updates = [];
    let match;
    while ((match = updateRegex.exec(content)) !== null) {
      updates.push(match[0]);
    }

    const errsBefore = errors.length;
    process.stdout.write(`>> ${file}: ${updates.length} UPDATEs... `);

    for (let i = 0; i < updates.length; i++) {
      try {
        const [result] = await conn.execute(updates[i]);
        totalAffected += result.affectedRows;
        totalOk++;
      } catch (err) {
        totalErr++;
        errors.push(`[${file}#${i + 1}] ${err.message.substring(0, 150)}`);
      }
    }

    const errsThisFile = errors.length - errsBefore;
    console.log(`OK: ${updates.length - errsThisFile} | Err: ${errsThisFile} | Total: ${totalOk}/${totalOk + totalErr}`);
  }

  await conn.end();

  console.log('\n========================================');
  console.log('RESULTADO FINAL');
  console.log(`  Exitosos:       ${totalOk}`);
  console.log(`  Errores:        ${totalErr}`);
  console.log(`  Filas afectadas: ${totalAffected}`);
  console.log('========================================');

  if (errors.length > 0) {
    console.log(`\nDetalle de errores (${errors.length}):`);
    errors.forEach(e => console.log(`  - ${e}`));
  }
}

run().catch(err => {
  console.error('Error fatal:', err.message);
  process.exit(1);
});
