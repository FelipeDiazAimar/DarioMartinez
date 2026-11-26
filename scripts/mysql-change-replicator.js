/**
 * Replicador por eventos / detección real de cambios (MySQL -> Supabase vía webhook).
 * No sobrescribe la BD cada cierto tiempo: consulta en MySQL únicamente
 * MAX(movimiento) de `kardex` y CHECKSUM TABLE de `articulos` (O(1), casi 0 carga)
 * y SOLO dispara POST /api/catalog/sync cuando detecta un cambio real.
 *
 * Uso en el servidor local (junto a MySQL):
 *   node scripts/mysql-change-replicator.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local'), override: true });
const mysql = require('mysql2/promise');

const WEBHOOK_URL =
  process.env.CATALOG_SYNC_WEBHOOK_URL ||
  'https://dariomartinezcomputacion.com.ar/api/catalog/sync';
const SYNC_TOKEN = process.env.API_TOKEN || '';
const CHECK_INTERVAL_MS = Number(process.env.MYSQL_CHANGE_CHECK_MS || '8000');

let lastSignature = null;
let isSyncing = false;

async function createDbConnection() {
  if (process.env.MYSQL_URL || process.env.DATABASE_URL) {
    return mysql.createConnection(process.env.MYSQL_URL || process.env.DATABASE_URL);
  }
  return mysql.createConnection({
    host: process.env.MYSQL_HOST || process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || '3306'),
    user: process.env.MYSQL_USER || process.env.DB_USER,
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME,
  });
}

async function readChangeSignature(conn) {
  const [kardexRows] = await conn.query('SELECT COALESCE(MAX(movimiento), 0) AS maxMov, COUNT(*) AS totalMov FROM kardex');
  const [artChecksumRows] = await conn.query('CHECKSUM TABLE articulos');
  const maxMov = kardexRows[0]?.maxMov ?? 0;
  const totalMov = kardexRows[0]?.totalMov ?? 0;
  const artChecksum = artChecksumRows[0]?.Checksum ?? 0;
  return `${maxMov}:${totalMov}:${artChecksum}`;
}

async function triggerSyncWebhook(signature) {
  if (isSyncing) return;
  isSyncing = true;
  try {
    console.log(`[replicator] Cambio detectado (${signature}). Replicando diferencias a Supabase...`);
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'x-sync-token': SYNC_TOKEN,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(45000),
    });
    const data = await res.json().catch(() => ({}));
    console.log(`[replicator] Resultado HTTP ${res.status}:`, data.message || data.error || data);
  } catch (err) {
    console.error('[replicator] Error llamando webhook:', err.message);
  } finally {
    isSyncing = false;
  }
}

async function loop() {
  let conn;
  try {
    conn = await createDbConnection();
    console.log(`[replicator] Conectado a MySQL. Esperando cambios reales para replicar hacia ${WEBHOOK_URL}`);

    // Firma inicial
    lastSignature = await readChangeSignature(conn);
    await triggerSyncWebhook(lastSignature);

    setInterval(async () => {
      try {
        const currentSignature = await readChangeSignature(conn);
        if (currentSignature !== lastSignature) {
          lastSignature = currentSignature;
          await triggerSyncWebhook(currentSignature);
        }
      } catch (err) {
        console.error('[replicator] Error verificando firma:', err.message);
      }
    }, CHECK_INTERVAL_MS);
  } catch (err) {
    console.error('[replicator] No se pudo conectar a MySQL:', err.message);
    process.exit(1);
  }
}

loop();
