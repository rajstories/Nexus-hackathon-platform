import { query } from '../sql';
import { Event, Track, EventJudge, EventWithDetails } from '../../types/event';
import { v4 as uuidv4 } from 'uuid';

export class EventRepository {
  static async create(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const result = await query<Event>(
      `INSERT INTO events (id, title, description, mode, start_at, end_at, organizer_id, created_at, updated_at)
       OUTPUT INSERTED.*
       VALUES (@id, @title, @description, @mode, @start_at, @end_at, @organizer_id, @created_at, @updated_at)`,
      {
        id,
        ...eventData,
        created_at: now,
        updated_at: now
      }
    );
    return result.recordset[0];
  }

  static async findById(id: string): Promise<Event | null> {
    const result = await query<Event>(
      'SELECT * FROM events WHERE id = @id',
      { id }
    );
    return result.recordset[0] || null;
  }

  static async findByIdWithDetails(id: string): Promise<EventWithDetails | null> {
    const event = await this.findById(id);
    if (!event) return null;

    const tracks = await this.getEventTracks(id);
    const judges = await this.getEventJudges(id);

    return {
      ...event,
      tracks,
      judges
    };
  }

  static async getEventTracks(eventId: string): Promise<Track[]> {
    const result = await query<Track>(
      'SELECT * FROM tracks WHERE event_id = @eventId ORDER BY created_at ASC',
      { eventId }
    );
    return result.recordset;
  }

  static async getEventJudges(eventId: string): Promise<(EventJudge & {
    user: {
      id: string;
      name: string;
      email: string;
    };
  })[]> {
    const result = await query<any>(
      `SELECT 
        ej.id, ej.event_id, ej.user_id, ej.assigned_at,
        u.id as user_id, u.name as user_name, u.email as user_email
       FROM event_judges ej
       INNER JOIN users u ON ej.user_id = u.id
       WHERE ej.event_id = @eventId
       ORDER BY ej.assigned_at ASC`,
      { eventId }
    );
    
    return result.recordset.map((row: any) => ({
      id: row.id,
      event_id: row.event_id,
      user_id: row.user_id,
      assigned_at: row.assigned_at,
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email
      }
    }));
  }

  static async createTrack(eventId: string, trackData: Omit<Track, 'id' | 'event_id' | 'created_at' | 'updated_at'>): Promise<Track> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const result = await query<Track>(
      `INSERT INTO tracks (id, event_id, name, description, max_teams, created_at, updated_at)
       OUTPUT INSERTED.*
       VALUES (@id, @event_id, @name, @description, @max_teams, @created_at, @updated_at)`,
      {
        id,
        event_id: eventId,
        ...trackData,
        created_at: now,
        updated_at: now
      }
    );
    return result.recordset[0];
  }

  static async assignJudge(eventId: string, userId: string): Promise<EventJudge> {
    const id = uuidv4();
    const assignedAt = new Date().toISOString();
    
    const result = await query<EventJudge>(
      `INSERT INTO event_judges (id, event_id, user_id, assigned_at)
       OUTPUT INSERTED.*
       VALUES (@id, @event_id, @user_id, @assigned_at)`,
      {
        id,
        event_id: eventId,
        user_id: userId,
        assigned_at: assignedAt
      }
    );
    return result.recordset[0];
  }

  static async checkJudgeAlreadyAssigned(eventId: string, userId: string): Promise<boolean> {
    const result = await query<{ count: number }>(
      'SELECT COUNT(*) as count FROM event_judges WHERE event_id = @eventId AND user_id = @userId',
      { eventId, userId }
    );
    return result.recordset[0].count > 0;
  }

  static async isEventOrganizer(eventId: string, userId: string): Promise<boolean> {
    const result = await query<{ count: number }>(
      'SELECT COUNT(*) as count FROM events WHERE id = @eventId AND organizer_id = @userId',
      { eventId, userId }
    );
    return result.recordset[0].count > 0;
  }
}