import { pgTable, varchar, text, timestamp, uuid, boolean, decimal, integer, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with Firebase integration
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firebaseUid: varchar("firebase_uid", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: varchar("role", { length: 50 }).notNull().default("participant"),
  school: varchar("school", { length: 255 }),
  bio: text("bio"),
  skills: text("skills"), // JSON array stored as text
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Events table
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  mode: varchar("mode", { length: 10 }).notNull(),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  organizerId: uuid("organizer_id").notNull().references(() => users.id),
  rubricId: uuid("rubric_id").references(() => rubrics.id),
  feedbackReleaseAt: timestamp("feedback_release_at"),
  requirePoap: boolean("require_poap").default(false).notNull(),
  poapEventCode: varchar("poap_event_code", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Teams table
export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  name: varchar("name", { length: 100 }).notNull(),
  inviteCode: varchar("invite_code", { length: 10 }).notNull().unique(),
  createdById: uuid("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Team members junction table
export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").notNull().references(() => teams.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Rubrics table for transparent feedback
export const rubrics = pgTable("rubrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Rubric criteria for detailed evaluation
export const rubricCriteria = pgTable("rubric_criteria", {
  id: uuid("id").primaryKey().defaultRandom(),
  rubricId: uuid("rubric_id").notNull().references(() => rubrics.id),
  key: varchar("key", { length: 100 }).notNull().unique(),
  label: varchar("label", { length: 255 }).notNull(),
  weight: integer("weight").notNull().default(1),
  description: text("description"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueRubricKey: unique().on(table.rubricId, table.key),
}));

// Submissions table
export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").notNull().references(() => teams.id),
  eventId: uuid("event_id").notNull().references(() => events.id),
  title: varchar("title", { length: 200 }).notNull(),
  repoUrl: varchar("repo_url", { length: 500 }),
  demoUrl: varchar("demo_url", { length: 500 }),
  fileUrl: varchar("file_url", { length: 1000 }),
  fileName: varchar("file_name", { length: 255 }),
  fileSize: varchar("file_size", { length: 50 }),
  submittedById: uuid("submitted_by_id").notNull().references(() => users.id),
  decision: varchar("decision", { length: 20 }).notNull().default("pending"), // 'pending','accepted','rejected','finalist','winner'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Judge assignments for events
export const judgeAssignments = pgTable("judge_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  judgeId: uuid("judge_id").notNull().references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
}, (table) => ({
  uniqueJudgeEvent: unique().on(table.eventId, table.judgeId),
}));

// Evaluation criteria for events
export const evaluationCriteria = pgTable("evaluation_criteria", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  maxScore: integer("max_score").notNull().default(10),
  weight: decimal("weight", { precision: 3, scale: 2 }).notNull().default("1.00"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Scores table for multi-round evaluation
export const scores = pgTable("scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").notNull().references(() => submissions.id),
  judgeId: uuid("judge_id").notNull().references(() => users.id),
  criteriaId: uuid("criteria_id").notNull().references(() => evaluationCriteria.id),
  rubricCriteriaId: uuid("rubric_criteria_id").references(() => rubricCriteria.id),
  round: integer("round").notNull().default(1),
  score: decimal("score", { precision: 4, scale: 2 }).notNull(),
  feedback: text("feedback"),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueJudgeSubmissionCriteriaRound: unique().on(table.submissionId, table.judgeId, table.criteriaId, table.round),
}));

// Participant profiles for detailed information
export const participantProfiles = pgTable("participant_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id).unique(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }),
  mobile: varchar("mobile", { length: 20 }).notNull(),
  countryCode: varchar("country_code", { length: 5 }).notNull().default("+91"),
  gender: varchar("gender", { length: 20 }).notNull(),
  instituteName: varchar("institute_name", { length: 255 }).notNull(),
  participantType: varchar("participant_type", { length: 50 }).notNull(), // College Students, Professional, etc
  domain: varchar("domain", { length: 100 }).notNull(),
  course: varchar("course", { length: 255 }),
  courseSpecialization: varchar("course_specialization", { length: 255 }),
  graduatingYear: integer("graduating_year"),
  courseDuration: varchar("course_duration", { length: 50 }),
  location: varchar("location", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Hackathon registrations table
export const hackathonRegistrations = pgTable("hackathon_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  hackathonId: varchar("hackathon_id", { length: 50 }).notNull(), // Links to hackathon data
  hackathonTitle: varchar("hackathon_title", { length: 255 }).notNull(),
  registrationData: text("registration_data"), // JSON data for hackathon-specific fields
  status: varchar("status", { length: 20 }).notNull().default("registered"),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserHackathon: unique().on(table.userId, table.hackathonId),
}));

// Event reviews for credibility (verified users only)
export const eventReviews = pgTable("event_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 20 }).notNull(), // 'participant', 'judge', 'organizer'
  rating: integer("rating").notNull(), // 1-5
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserEvent: unique().on(table.eventId, table.userId),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  teamsCreated: many(teams),
  teamMemberships: many(teamMembers),
  eventsOrganized: many(events),
  participantProfile: one(participantProfiles),
  hackathonRegistrations: many(hackathonRegistrations),
  eventReviews: many(eventReviews),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  rubric: one(rubrics, {
    fields: [events.rubricId],
    references: [rubrics.id],
  }),
  teams: many(teams),
  judgeAssignments: many(judgeAssignments),
  evaluationCriteria: many(evaluationCriteria),
  rubrics: many(rubrics),
  eventReviews: many(eventReviews),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  event: one(events, {
    fields: [teams.eventId],
    references: [events.id],
  }),
  createdBy: one(users, {
    fields: [teams.createdById],
    references: [users.id],
  }),
  members: many(teamMembers),
  submissions: many(submissions),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  team: one(teams, {
    fields: [submissions.teamId],
    references: [teams.id],
  }),
  event: one(events, {
    fields: [submissions.eventId],
    references: [events.id],
  }),
  submittedBy: one(users, {
    fields: [submissions.submittedById],
    references: [users.id],
  }),
  scores: many(scores),
}));

export const judgeAssignmentsRelations = relations(judgeAssignments, ({ one }) => ({
  event: one(events, {
    fields: [judgeAssignments.eventId],
    references: [events.id],
  }),
  judge: one(users, {
    fields: [judgeAssignments.judgeId],
    references: [users.id],
  }),
}));

export const evaluationCriteriaRelations = relations(evaluationCriteria, ({ one, many }) => ({
  event: one(events, {
    fields: [evaluationCriteria.eventId],
    references: [events.id],
  }),
  scores: many(scores),
}));

export const rubricsRelations = relations(rubrics, ({ one, many }) => ({
  event: one(events, {
    fields: [rubrics.eventId],
    references: [events.id],
  }),
  criteria: many(rubricCriteria),
}));

export const rubricCriteriaRelations = relations(rubricCriteria, ({ one, many }) => ({
  rubric: one(rubrics, {
    fields: [rubricCriteria.rubricId],
    references: [rubrics.id],
  }),
  scores: many(scores),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  submission: one(submissions, {
    fields: [scores.submissionId],
    references: [submissions.id],
  }),
  judge: one(users, {
    fields: [scores.judgeId],
    references: [users.id],
  }),
  criteria: one(evaluationCriteria, {
    fields: [scores.criteriaId],
    references: [evaluationCriteria.id],
  }),
  rubricCriterion: one(rubricCriteria, {
    fields: [scores.rubricCriteriaId],
    references: [rubricCriteria.id],
  }),
}));

export const participantProfilesRelations = relations(participantProfiles, ({ one }) => ({
  user: one(users, {
    fields: [participantProfiles.userId],
    references: [users.id],
  }),
}));

export const hackathonRegistrationsRelations = relations(hackathonRegistrations, ({ one }) => ({
  user: one(users, {
    fields: [hackathonRegistrations.userId],
    references: [users.id],
  }),
}));

export const eventReviewsRelations = relations(eventReviews, ({ one }) => ({
  event: one(events, {
    fields: [eventReviews.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventReviews.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertEventSchema = createInsertSchema(events);
export const insertTeamSchema = createInsertSchema(teams);
export const insertTeamMemberSchema = createInsertSchema(teamMembers);
export const insertRubricSchema = createInsertSchema(rubrics);
export const insertRubricCriteriaSchema = createInsertSchema(rubricCriteria);
export const insertSubmissionSchema = createInsertSchema(submissions);
export const insertJudgeAssignmentSchema = createInsertSchema(judgeAssignments);
export const insertEvaluationCriteriaSchema = createInsertSchema(evaluationCriteria);
export const insertScoreSchema = createInsertSchema(scores);
export const insertParticipantProfileSchema = createInsertSchema(participantProfiles);
export const insertHackathonRegistrationSchema = createInsertSchema(hackathonRegistrations);
export const insertEventReviewSchema = createInsertSchema(eventReviews);

// Type exports
export type User = typeof users.$inferSelect;

// User profile update schema
export const updateProfileSchema = createInsertSchema(users).pick({
  name: true,
  school: true,
  bio: true,
  skills: true,
}).extend({
  skills: z.array(z.string()).optional().transform(skills => skills ? JSON.stringify(skills) : undefined),
});

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
export type InsertUser = typeof users.$inferInsert;
export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;
export type Rubric = typeof rubrics.$inferSelect;
export type InsertRubric = typeof rubrics.$inferInsert;
export type RubricCriteria = typeof rubricCriteria.$inferSelect;
export type InsertRubricCriteria = typeof rubricCriteria.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;
export type JudgeAssignment = typeof judgeAssignments.$inferSelect;
export type InsertJudgeAssignment = typeof judgeAssignments.$inferInsert;
export type EvaluationCriteria = typeof evaluationCriteria.$inferSelect;
export type InsertEvaluationCriteria = typeof evaluationCriteria.$inferInsert;
export type Score = typeof scores.$inferSelect;
export type InsertScore = typeof scores.$inferInsert;
export type ParticipantProfile = typeof participantProfiles.$inferSelect;
export type InsertParticipantProfile = typeof participantProfiles.$inferInsert;
export type HackathonRegistration = typeof hackathonRegistrations.$inferSelect;
export type InsertHackathonRegistration = typeof hackathonRegistrations.$inferInsert;
export type EventReview = typeof eventReviews.$inferSelect;
export type InsertEventReview = typeof eventReviews.$inferInsert;
