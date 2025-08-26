import { z } from 'zod';

// Event creation schema
export const CreateEventSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  mode: z.enum(['online', 'offline'], {
    errorMap: () => ({ message: 'Mode must be either "online" or "offline"' })
  }),
  start_at: z.string()
    .datetime({ message: 'Start date must be a valid ISO datetime' })
    .refine((date) => new Date(date) > new Date(), {
      message: 'Start date must be in the future'
    }),
  end_at: z.string()
    .datetime({ message: 'End date must be a valid ISO datetime' })
}).refine((data) => new Date(data.end_at) > new Date(data.start_at), {
  message: 'End date must be after start date',
  path: ['end_at']
});

// Track creation schema
export const CreateTrackSchema = z.object({
  name: z.string()
    .min(1, 'Track name is required')
    .max(100, 'Track name must be less than 100 characters'),
  description: z.string()
    .min(1, 'Track description is required')
    .max(1000, 'Track description must be less than 1000 characters'),
  max_teams: z.number()
    .int('Maximum teams must be a whole number')
    .min(1, 'Maximum teams must be at least 1')
    .max(1000, 'Maximum teams cannot exceed 1000')
    .optional()
});

// Judge assignment schema
export const AssignJudgeSchema = z.object({
  user_id: z.string()
    .uuid('User ID must be a valid UUID')
});

// Rubric creation schema
export const CreateRubricSchema = z.object({
  name: z.string()
    .min(1, 'Rubric name is required')
    .max(100, 'Rubric name must be less than 100 characters'),
  description: z.string()
    .min(1, 'Rubric description is required')
    .max(1000, 'Rubric description must be less than 1000 characters'),
  criteria: z.array(z.object({
    key: z.string()
      .min(1, 'Criterion key is required')
      .max(50, 'Criterion key must be less than 50 characters')
      .regex(/^[a-z0-9_]+$/, 'Criterion key must contain only lowercase letters, numbers, and underscores'),
    label: z.string()
      .min(1, 'Criterion label is required')
      .max(100, 'Criterion label must be less than 100 characters'),
    weight: z.number()
      .int('Weight must be a whole number')
      .min(1, 'Weight must be at least 1')
      .max(100, 'Weight cannot exceed 100'),
    description: z.string()
      .min(1, 'Criterion description is required')
      .max(500, 'Criterion description must be less than 500 characters')
  })).min(1, 'At least one criterion is required')
    .max(10, 'Cannot have more than 10 criteria')
});

// Feedback release schema
export const SetFeedbackReleaseSchema = z.object({
  feedback_release_at: z.string()
    .datetime({ message: 'Feedback release date must be a valid ISO datetime' })
    .refine((date) => new Date(date) > new Date(), {
      message: 'Feedback release date must be in the future'
    })
});

// Event response types
export interface Event {
  id: string;
  title: string;
  description: string;
  mode: 'online' | 'offline';
  start_at: string;
  end_at: string;
  organizer_id: string;
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: string;
  event_id: string;
  name: string;
  description: string;
  max_teams?: number;
  created_at: string;
  updated_at: string;
}

export interface EventJudge {
  id: string;
  event_id: string;
  user_id: string;
  assigned_at: string;
}

export interface EventWithDetails extends Event {
  tracks: Track[];
  judges: (EventJudge & {
    user: {
      id: string;
      name: string;
      email: string;
    };
  })[];
}

export interface Rubric {
  id: string;
  event_id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface RubricCriterion {
  id: string;
  rubric_id: string;
  key: string;
  label: string;
  weight: number;
  description: string;
  display_order: number;
  created_at: string;
}

export interface RubricWithCriteria extends Rubric {
  criteria: RubricCriterion[];
}

// Type exports for request bodies
export type CreateEventRequest = z.infer<typeof CreateEventSchema>;
export type CreateTrackRequest = z.infer<typeof CreateTrackSchema>;
export type AssignJudgeRequest = z.infer<typeof AssignJudgeSchema>;
export type CreateRubricRequest = z.infer<typeof CreateRubricSchema>;
export type SetFeedbackReleaseRequest = z.infer<typeof SetFeedbackReleaseSchema>;