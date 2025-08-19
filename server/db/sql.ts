import sql from 'mssql';

// Connection configuration
const config: sql.config = {
  server: process.env.AZURE_SQL_SERVER || '',
  database: process.env.AZURE_SQL_DB || '',
  user: process.env.AZURE_SQL_USER || '',
  password: process.env.AZURE_SQL_PASSWORD || '',
  options: {
    encrypt: true, // Required for Azure SQL
    trustServerCertificate: false,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  requestTimeout: 60000,
};

// Global connection pool
let pool: sql.ConnectionPool | null = null;

/**
 * Get or create the connection pool
 */
export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('Connected to Azure SQL Database');
  }
  return pool;
}

/**
 * Execute a query with parameters
 */
export async function query<T = any>(
  sqlQuery: string, 
  parameters: Record<string, any> = {}
): Promise<sql.IResult<T>> {
  const pool = await getPool();
  const request = pool.request();
  
  // Add parameters to the request
  for (const [key, value] of Object.entries(parameters)) {
    request.input(key, value);
  }
  
  return await request.query(sqlQuery);
}

/**
 * Execute a stored procedure with parameters
 */
export async function executeStoredProcedure<T = any>(
  procedureName: string,
  parameters: Record<string, any> = {}
): Promise<sql.IProcedureResult<T>> {
  const pool = await getPool();
  const request = pool.request();
  
  // Add parameters to the request
  for (const [key, value] of Object.entries(parameters)) {
    request.input(key, value);
  }
  
  return await request.execute(procedureName);
}

/**
 * Begin a transaction
 */
export async function beginTransaction(): Promise<sql.Transaction> {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  return transaction;
}

/**
 * Close the connection pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('Disconnected from Azure SQL Database');
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});