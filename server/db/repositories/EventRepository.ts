import { db } from '../../db';
import { events, teams, judgeAssignments, users } from '@shared/schema';
import { Event, Track, EventJudge, EventWithDetails } from '../../types/event';
import { eq } from 'drizzle-orm';

export class EventRepository {
  static async create(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values({
        title: eventData.title,
        description: eventData.description,
        mode: eventData.mode,
        startAt: new Date(eventData.start_at),
        endAt: new Date(eventData.end_at),
        organizerId: eventData.organizer_id,
      })
      .returning();
    
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      mode: event.mode,
      start_at: event.startAt.toISOString(),
      end_at: event.endAt.toISOString(),
      organizer_id: event.organizerId,
      created_at: event.createdAt.toISOString(),
      updated_at: event.updatedAt.toISOString(),
    };
  }

  static async findById(id: string): Promise<Event | null> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);
    
    if (!event) return null;
    
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      mode: event.mode,
      start_at: event.startAt.toISOString(),
      end_at: event.endAt.toISOString(),
      organizer_id: event.organizerId,
      created_at: event.createdAt.toISOString(),
      updated_at: event.updatedAt.toISOString(),
    };
  }

  static async findByIdWithDetails(id: string): Promise<EventWithDetails | null> {
    const event = await this.findById(id);
    if (!event) return null;

    // For now, return basic event details
    // We'll implement tracks and judges later when needed
    return {
      ...event,
      tracks: [],
      judges: []
    };
  }

  static async getEventTracks(eventId: string): Promise<Track[]> {
    // Return empty array for now - tracks functionality can be added later
    return [];
  }

  static async getEventJudges(eventId: string): Promise<(EventJudge & {
    user: {
      id: string;
      name: string;
      email: string;
    };
  })[]> {
    // Return empty array for now - judges functionality can be added later
    return [];
  }

  static async createTrack(eventId: string, trackData: Omit<Track, 'id' | 'event_id' | 'created_at' | 'updated_at'>): Promise<Track> {
    // Return mock track for now - tracks functionality can be added later
    return {
      id: 'mock-track-id',
      event_id: eventId,
      name: trackData.name,
      description: trackData.description || '',
      max_teams: trackData.max_teams || 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Track;
  }

  static async assignJudge(eventId: string, userId: string): Promise<EventJudge> {
    // Return mock assignment for now - judges functionality can be added later
    return {
      id: 'mock-judge-id',
      event_id: eventId,
      user_id: userId,
      assigned_at: new Date().toISOString()
    } as EventJudge;
  }

  static async checkJudgeAlreadyAssigned(eventId: string, userId: string): Promise<boolean> {
    // Return false for now - judges functionality can be added later
    return false;
  }

  static async isEventOrganizer(eventId: string, userId: string): Promise<boolean> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);
    
    return event?.organizerId === userId;
  }

  static async findByOrganizerId(organizerId: string): Promise<Event[]> {
    const eventList = await db
      .select()
      .from(events)
      .where(eq(events.organizerId, organizerId));
    
    return eventList.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      mode: event.mode,
      start_at: event.startAt.toISOString(),
      end_at: event.endAt.toISOString(),
      organizer_id: event.organizerId,
      created_at: event.createdAt.toISOString(),
      updated_at: event.updatedAt.toISOString(),
    }));
  }
}