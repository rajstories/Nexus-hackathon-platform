import sql from 'mssql';

// Azure SQL Database configuration
const azureSqlConfig = {
  server: process.env.AZURE_SQL_SERVER || '',
  database: process.env.AZURE_SQL_DATABASE || '',
  user: process.env.AZURE_SQL_USER || '',
  password: process.env.AZURE_SQL_PASSWORD || '',
  port: 1433,
  options: {
    encrypt: true, // Use encryption for Azure SQL
    trustServerCertificate: false, // Don't trust self-signed certificates
    enableArithAbort: true,
    requestTimeout: 300000,
  },
  pool: {
    max: 20,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let azurePool: sql.ConnectionPool | null = null;

export async function connectAzureSQL(): Promise<sql.ConnectionPool> {
  try {
    if (!azurePool) {
      azurePool = new sql.ConnectionPool(azureSqlConfig);
      await azurePool.connect();
      console.log('✅ Connected to Azure SQL Database');
    }
    return azurePool;
  } catch (error) {
    console.error('❌ Failed to connect to Azure SQL Database:', error);
    throw error;
  }
}

export async function disconnectAzureSQL(): Promise<void> {
  try {
    if (azurePool) {
      await azurePool.close();
      azurePool = null;
      console.log('✅ Disconnected from Azure SQL Database');
    }
  } catch (error) {
    console.error('❌ Error disconnecting from Azure SQL:', error);
  }
}

// Initialize Azure SQL Database schema
export async function initializeAzureSQLSchema(): Promise<void> {
  try {
    const pool = await connectAzureSQL();
    
    // Create analytics tables for competition requirements
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='event_analytics' and xtype='U')
      CREATE TABLE event_analytics (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        event_id UNIQUEIDENTIFIER NOT NULL,
        metric_name NVARCHAR(100) NOT NULL,
        metric_value DECIMAL(10,2) NOT NULL,
        recorded_at DATETIME2 DEFAULT GETUTCDATE(),
        INDEX IX_event_analytics_event_id (event_id),
        INDEX IX_event_analytics_metric (metric_name)
      );
    `);

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='submission_analytics' and xtype='U')
      CREATE TABLE submission_analytics (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        submission_id UNIQUEIDENTIFIER NOT NULL,
        team_id UNIQUEIDENTIFIER NOT NULL,
        similarity_score DECIMAL(5,2),
        plagiarism_flags INT DEFAULT 0,
        evaluation_metrics NVARCHAR(MAX), -- JSON data
        processed_at DATETIME2 DEFAULT GETUTCDATE(),
        INDEX IX_submission_analytics_team_id (team_id),
        INDEX IX_submission_analytics_similarity (similarity_score)
      );
    `);

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='user_engagement' and xtype='U')
      CREATE TABLE user_engagement (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER NOT NULL,
        event_id UNIQUEIDENTIFIER NOT NULL,
        action_type NVARCHAR(50) NOT NULL,
        action_data NVARCHAR(MAX), -- JSON data
        timestamp DATETIME2 DEFAULT GETUTCDATE(),
        INDEX IX_user_engagement_user_id (user_id),
        INDEX IX_user_engagement_event_id (event_id),
        INDEX IX_user_engagement_timestamp (timestamp)
      );
    `);

    console.log('✅ Azure SQL Database schema initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Azure SQL schema:', error);
    throw error;
  }
}

// Analytics functions for competition requirements
export class AzureSQLAnalytics {
  static async recordEventMetric(eventId: string, metricName: string, value: number): Promise<void> {
    const pool = await connectAzureSQL();
    await pool.request()
      .input('eventId', sql.UniqueIdentifier, eventId)
      .input('metricName', sql.NVarChar(100), metricName)
      .input('value', sql.Decimal(10, 2), value)
      .query(`
        INSERT INTO event_analytics (event_id, metric_name, metric_value)
        VALUES (@eventId, @metricName, @value)
      `);
  }

  static async recordSubmissionAnalytics(submissionId: string, teamId: string, data: {
    similarityScore?: number;
    plagiarismFlags?: number;
    evaluationMetrics?: any;
  }): Promise<void> {
    const pool = await connectAzureSQL();
    await pool.request()
      .input('submissionId', sql.UniqueIdentifier, submissionId)
      .input('teamId', sql.UniqueIdentifier, teamId)
      .input('similarityScore', sql.Decimal(5, 2), data.similarityScore || null)
      .input('plagiarismFlags', sql.Int, data.plagiarismFlags || 0)
      .input('evaluationMetrics', sql.NVarChar(sql.MAX), JSON.stringify(data.evaluationMetrics || {}))
      .query(`
        INSERT INTO submission_analytics (submission_id, team_id, similarity_score, plagiarism_flags, evaluation_metrics)
        VALUES (@submissionId, @teamId, @similarityScore, @plagiarismFlags, @evaluationMetrics)
      `);
  }

  static async recordUserEngagement(userId: string, eventId: string, actionType: string, actionData: any): Promise<void> {
    const pool = await connectAzureSQL();
    await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('eventId', sql.UniqueIdentifier, eventId)
      .input('actionType', sql.NVarChar(50), actionType)
      .input('actionData', sql.NVarChar(sql.MAX), JSON.stringify(actionData))
      .query(`
        INSERT INTO user_engagement (user_id, event_id, action_type, action_data)
        VALUES (@userId, @eventId, @actionType, @actionData)
      `);
  }

  static async getEventAnalytics(eventId: string): Promise<any[]> {
    const pool = await connectAzureSQL();
    const result = await pool.request()
      .input('eventId', sql.UniqueIdentifier, eventId)
      .query(`
        SELECT 
          metric_name,
          AVG(metric_value) as avg_value,
          MAX(metric_value) as max_value,
          MIN(metric_value) as min_value,
          COUNT(*) as count
        FROM event_analytics 
        WHERE event_id = @eventId 
        GROUP BY metric_name
        ORDER BY metric_name
      `);
    return result.recordset;
  }

  static async getPlagiarismStats(eventId?: string): Promise<any[]> {
    const pool = await connectAzureSQL();
    let query = `
      SELECT 
        COUNT(*) as total_submissions,
        AVG(similarity_score) as avg_similarity,
        SUM(plagiarism_flags) as total_flags,
        COUNT(CASE WHEN similarity_score > 70 THEN 1 END) as high_similarity_count
      FROM submission_analytics sa
    `;
    
    if (eventId) {
      query += ` 
        JOIN teams t ON sa.team_id = t.id 
        WHERE t.event_id = @eventId
      `;
    }

    const request = pool.request();
    if (eventId) {
      request.input('eventId', sql.UniqueIdentifier, eventId);
    }
    
    const result = await request.query(query);
    return result.recordset;
  }
}

export { sql };