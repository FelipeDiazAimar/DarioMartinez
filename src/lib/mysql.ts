import mysql from 'mysql2/promise';

const systemSchemas = ['information_schema', 'mysql', 'performance_schema', 'sys'];

let pool: mysql.Pool | null = null;

type ProductosFilters = {
  tableName?: string;
  searchColumn?: string;
  searchTerm?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
};

function getPool() {
  if (pool) {
    return pool;
  }

  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const port = Number(process.env.MYSQL_PORT ?? '3306');

  if (!host || !user || !password) {
    throw new Error('Faltan variables de entorno MySQL: MYSQL_HOST, MYSQL_USER o MYSQL_PASSWORD.');
  }

  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    waitForConnections: true,
    connectionLimit: 5,
    namedPlaceholders: true,
  });

  return pool;
}

async function resolveTableSchema(connection: mysql.PoolConnection, tableName: string) {
  const configuredDatabase = process.env.MYSQL_DATABASE;

  if (configuredDatabase) {
    return configuredDatabase;
  }

  const [rows] = await connection.query<mysql.RowDataPacket[]>(
    `
      SELECT TABLE_SCHEMA
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_NAME = ?
        AND TABLE_SCHEMA NOT IN (?, ?, ?, ?)
      ORDER BY TABLE_SCHEMA ASC
      LIMIT 1
    `,
    [tableName, ...systemSchemas],
  );

  const schema = rows[0]?.TABLE_SCHEMA as string | undefined;

  if (!schema) {
    throw new Error(
      `No se encontró la tabla "${tableName}". Define MYSQL_DATABASE o crea la tabla en el servidor MySQL.`,
    );
  }

  return schema;
}

export async function getProductos(page = 1, pageSize = 200, filters: ProductosFilters = {}) {
  const tableName = filters.tableName?.trim() || process.env.MYSQL_TABLE || 'articulos';
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.min(Math.floor(pageSize), 500) : 200;
  const poolInstance = getPool();
  const connection = await poolInstance.getConnection();

  try {
    const schema = await resolveTableSchema(connection, tableName);
    const tableRef = `${mysql.escapeId(schema)}.${mysql.escapeId(tableName)}`;

    const [columnsRows] = await connection.query<mysql.RowDataPacket[]>(
      `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ?
          AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION ASC
      `,
      [schema, tableName],
    );

    const availableColumns = columnsRows.map((row) => String(row.COLUMN_NAME));
    const normalizedSearchColumn = filters.searchColumn && availableColumns.includes(filters.searchColumn)
      ? filters.searchColumn
      : undefined;
    const normalizedSearchTerm = filters.searchTerm?.trim() ? filters.searchTerm.trim() : undefined;
    const shouldFilter = Boolean(normalizedSearchColumn && normalizedSearchTerm);
    const normalizedOrderBy = filters.orderBy && availableColumns.includes(filters.orderBy)
      ? filters.orderBy
      : undefined;
    const normalizedOrderDirection = filters.orderDirection === 'desc' ? 'desc' : 'asc';

    const whereClause = shouldFilter
      ? ` WHERE ${mysql.escapeId(normalizedSearchColumn!)} LIKE ?`
      : '';
    const whereParams = shouldFilter ? [`%${normalizedSearchTerm}%`] : [];

    const orderClause = normalizedOrderBy
      ? ` ORDER BY ${mysql.escapeId(normalizedOrderBy)} ${normalizedOrderDirection.toUpperCase()}`
      : '';

    const [countRows] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM ${tableRef}${whereClause}`,
      whereParams,
    );

    const total = Number(countRows[0]?.total ?? 0);
    const totalPages = total > 0 ? Math.ceil(total / safePageSize) : 1;
    const normalizedPage = Math.min(safePage, totalPages);
    const normalizedOffset = (normalizedPage - 1) * safePageSize;
    const rowsParams = [...whereParams, safePageSize, normalizedOffset];

    const [rows] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT * FROM ${tableRef}${whereClause}${orderClause} LIMIT ? OFFSET ?`,
      rowsParams,
    );

    return {
      schema,
      tableName,
      availableColumns,
      searchColumn: normalizedSearchColumn,
      searchTerm: normalizedSearchTerm,
      page: normalizedPage,
      pageSize: safePageSize,
      total,
      totalPages,
      rows: rows.map((row) => ({ ...row })),
    };
  } finally {
    connection.release();
  }
}
