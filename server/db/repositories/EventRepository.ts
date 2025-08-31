import { db } from '../../db';
import { events, teams, judgeAssignments, users, rubrics, rubricCriteria } from '@shared/schema';
import { Event, Track, EventJudge, EventWithDetails, Rubric, RubricWithCriteria } from '../../types/event';
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
    // For now return mock data until we implement tracks table
    return [
      {
        id: '1',
        event_id: eventId,
        name: 'AI & Machine Learning',
        description: 'Build intelligent applications',
        max_teams: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2', 
        event_id: eventId,
        name: 'Web3 & Blockchain',
        description: 'Decentralized solutions',
        max_teams: 12,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        event_id: eventId, 
        name: 'Social Impact',
        description: 'Technology for good',
        max_teams: 8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        event_id: eventId,
        name: 'Open Innovation', 
        description: 'Any creative solution',
        max_teams: 7,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
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
    // Generate a new track ID and return the created track
    const newTrack = {
      id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      event_id: eventId,
      name: trackData.name,
      description: trackData.description || '',
      max_teams: trackData.max_teams || 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Track;
    
    return newTrack;
  }

  static async updateTrack(trackId: string, trackData: Omit<Track, 'id' | 'event_id' | 'created_at' | 'updated_at'>): Promise<Track> {
    // For now, return updated mock track
    return {
      id: trackId,
      event_id: 'current-event-id',
      name: trackData.name,
      description: trackData.description || '',
      max_teams: trackData.max_teams || 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Track;
  }

  static async deleteTrack(trackId: string): Promise<void> {
    // For now, this is a no-op since we're using mock data
    // In a real implementation, this would delete from the tracks table
    return;
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

  static async createRubric(eventId: string, rubricData: {
    name: string;
    description: string;
    criteria: Array<{
      key: string;
      label: string;
      weight: number;
      description: string;
    }>;
  }): Promise<RubricWithCriteria> {
    return await db.transaction(async (tx) => {
      // Create the rubric
      const [rubric] = await tx
        .insert(rubrics)
        .values({
          eventId: eventId,
          name: rubricData.name,
          description: rubricData.description,
        })
        .returning();

      // Create the criteria
      const criteriaToInsert = rubricData.criteria.map((criterion, index) => ({
        rubricId: rubric.id,
        key: criterion.key,
        label: criterion.label,
        weight: criterion.weight,
        description: criterion.description,
        displayOrder: index,
      }));

      const createdCriteria = await tx
        .insert(rubricCriteria)
        .values(criteriaToInsert)
        .returning();

      // Update event with rubric_id
      await tx
        .update(events)
        .set({ rubricId: rubric.id })
        .where(eq(events.id, eventId));

      return {
        id: rubric.id,
        event_id: rubric.eventId,
        name: rubric.name,
        description: rubric.description || '',
        created_at: rubric.createdAt.toISOString(),
        criteria: createdCriteria.map((criterion) => ({
          id: criterion.id,
          rubric_id: criterion.rubricId,
          key: criterion.key,
          label: criterion.label,
          weight: criterion.weight,
          description: criterion.description || '',
          display_order: criterion.displayOrder,
          created_at: criterion.createdAt.toISOString(),
        })),
      };
    });
  }

  static async setFeedbackReleaseDate(eventId: string, feedbackReleaseAt: string): Promise<void> {
    await db
      .update(events)
      .set({ 
        feedbackReleaseAt: new Date(feedbackReleaseAt),
        updatedAt: new Date()
      })
      .where(eq(events.id, eventId));
  }

  static async findRubricByEventId(eventId: string): Promise<RubricWithCriteria | null> {
    const [rubric] = await db
      .select()
      .from(rubrics)
      .where(eq(rubrics.eventId, eventId))
      .limit(1);

    if (!rubric) return null;

    const criteria = await db
      .select()
      .from(rubricCriteria)
      .where(eq(rubricCriteria.rubricId, rubric.id))
      .orderBy(rubricCriteria.displayOrder);

    return {
      id: rubric.id,
      event_id: rubric.eventId,
      name: rubric.name,
      description: rubric.description || '',
      created_at: rubric.createdAt.toISOString(),
      criteria: criteria.map((criterion) => ({
        id: criterion.id,
        rubric_id: criterion.rubricId,
        key: criterion.key,
        label: criterion.label,
        weight: criterion.weight,
        description: criterion.description || '',
        display_order: criterion.displayOrder,
        created_at: criterion.createdAt.toISOString(),
      })),
    };
  }
}