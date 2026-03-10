const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: 'SERVIDOR-DM',
  port: 3306,
  user: 'infocor',
  password: 'Sistema',
  database: 'gv6dariomartinez',
  charset: 'latin1',
};

async function main() {
  const conn = await mysql.createConnection(DB_CONFIG);
  try {
    const [cols] = await conn.query("SHOW COLUMNS FROM kardex");
    console.log("=== KARDEX COLUMNS ===");
    console.log(JSON.stringify(cols, null, 2));

    const [sample] = await conn.query("SELECT * FROM kardex ORDER BY fecha DESC LIMIT 5");
    console.log("\n=== LAST 5 KARDEX RECORDS ===");
    console.log(JSON.stringify(sample, null, 2));

    const [artCols] = await conn.query("SHOW COLUMNS FROM articulos WHERE Field LIKE '%stock%' OR Field LIKE '%linea%' OR Field LIKE '%rubro%' OR Field LIKE '%codigo%' OR Field LIKE '%descrip%' OR Field LIKE '%deposito%' OR Field LIKE '%cantidad%'");
    console.log("\n=== ARTICULOS STOCK-RELATED COLUMNS ===");
    console.log(JSON.stringify(artCols, null, 2));
  } finally {
    await conn.end();
  }
}

main().catch(err => { console.error('ERROR', err); process.exit(1); });
