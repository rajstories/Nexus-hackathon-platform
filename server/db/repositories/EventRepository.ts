import { query } from '../sql';

export interface Event {
  id: string;
  title: string;
  description?: string;
  mode: string;
  start_at: Date;
  end_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface EventWithStats extends Event {
  team_count: number;
  participant_count: number;
  submission_count: number;
}

export class EventRepository {
  static async findAll(): Promise<Event[]> {
    const result = await query<Event>(
      'SELECT * FROM events ORDER BY start_at DESC'
    );
    return result.recordset;
  }

  static async findById(id: string): Promise<Event | null> {
    const result = await query<Event>(
      'SELECT * FROM events WHERE id = @id',
      { id }
    );
    return result.recordset[0] || null;
  }

  static async findWithStats(id: string): Promise<EventWithStats | null> {
    const result = await query<EventWithStats>(
      `SELECT 
        e.*,
        ISNULL(team_stats.team_count, 0) as team_count,
        ISNULL(participant_stats.participant_count, 0) as participant_count,
        ISNULL(submission_stats.submission_count, 0) as submission_count
       FROM events e
       LEFT JOIN (
         SELECT event_id, COUNT(*) as team_count 
         FROM teams 
         GROUP BY event_id
       ) team_stats ON e.id = team_stats.event_id
       LEFT JOIN (
         SELECT t.event_id, COUNT(DISTINCT tm.user_id) as participant_count
         FROM teams t
         INNER JOIN team_members tm ON t.id = tm.team_id
         GROUP BY t.event_id
       ) participant_stats ON e.id = participant_stats.event_id
       LEFT JOIN (
         SELECT event_id, COUNT(*) as submission_count
         FROM submissions
         GROUP BY event_id
       ) submission_stats ON e.id = submission_stats.event_id
       WHERE e.id = @id`,
      { id }
    );
    return result.recordset[0] || null;
  }

  static async create(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    const result = await query<Event>(
      `INSERT INTO events (title, description, mode, start_at, end_at)
       OUTPUT INSERTED.*
       VALUES (@title, @description, @mode, @start_at, @end_at)`,
      eventData
    );
    return result.recordset[0];
  }

  static async update(id: string, eventData: Partial<Omit<Event, 'id' | 'created_at'>>): Promise<Event | null> {
    const setClause = Object.keys(eventData)
      .map(key => `${key} = @${key}`)
      .join(', ');
    
    if (!setClause) return null;

    const result = await query<Event>(
      `UPDATE events 
       SET ${setClause}, updated_at = GETUTCDATE()
       OUTPUT INSERTED.*
       WHERE id = @id`,
      { id, ...eventData }
    );
    return result.recordset[0] || null;
  }

  static async findUpcoming(): Promise<Event[]> {
    const result = await query<Event>(
      'SELECT * FROM events WHERE start_at > GETUTCDATE() ORDER BY start_at ASC'
    );
    return result.recordset;
  }

  static async findActive(): Promise<Event[]> {
    const result = await query<Event>(
      'SELECT * FROM events WHERE start_at <= GETUTCDATE() AND end_at >= GETUTCDATE() ORDER BY start_at ASC'
    );
    return result.recordset;
  }
}