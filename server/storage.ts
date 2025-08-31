import { users, teams, teamMembers, type User, type InsertUser, type Team, type InsertTeam, type TeamMember, type InsertTeamMember } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Database storage interface for PostgreSQL operations
export interface IStorage {
  // User operations
  getUserById(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUserFromFirebase(firebaseUid: string, name: string, email: string): Promise<User>;
  updateUserProfile(userId: string, profileData: { name?: string; school?: string | null; bio?: string | null; skills?: string; }): Promise<User>;
  
  // Team operations
  createTeam(team: InsertTeam): Promise<Team>;
  getTeamByInviteCode(inviteCode: string): Promise<Team | undefined>;
  getTeamById(id: string): Promise<Team | undefined>;
  
  // Team membership operations
  addTeamMember(membership: InsertTeamMember): Promise<TeamMember>;
  getUserTeams(userId: string): Promise<Team[]>;
  getTeamMembers(teamId: string): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async upsertUserFromFirebase(firebaseUid: string, name: string, email: string): Promise<User> {
    // Try to get existing user
    const existingUser = await this.getUserByFirebaseUid(firebaseUid);
    
    if (existingUser) {
      // Update existing user if name or email changed
      if (existingUser.name !== name || existingUser.email !== email) {
        const [updatedUser] = await db
          .update(users)
          .set({ 
            name, 
            email, 
            updatedAt: new Date() 
          })
          .where(eq(users.firebaseUid, firebaseUid))
          .returning();
        return updatedUser;
      }
      return existingUser;
    }

    // Create new user
    return this.createUser({
      firebaseUid,
      name,
      email,
      role: 'participant', // Default role
    });
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const [team] = await db
      .insert(teams)
      .values(insertTeam)
      .returning();
    return team;
  }

  async getTeamByInviteCode(inviteCode: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.inviteCode, inviteCode));
    return team || undefined;
  }

  async getTeamById(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async addTeamMember(membership: InsertTeamMember): Promise<TeamMember> {
    const [member] = await db
      .insert(teamMembers)
      .values(membership)
      .returning();
    return member;
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    const userTeams = await db
      .select({
        id: teams.id,
        eventId: teams.eventId,
        name: teams.name,
        inviteCode: teams.inviteCode,
        createdById: teams.createdById,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teams.id, teamMembers.teamId))
      .where(eq(teamMembers.userId, userId));

    return userTeams;
  }

  async getTeamMembers(teamId: string): Promise<User[]> {
    const members = await db
      .select({
        id: users.id,
        firebaseUid: users.firebaseUid,
        name: users.name,
        email: users.email,
        role: users.role,
        school: users.school,
        bio: users.bio,
        skills: users.skills,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(teamMembers)
      .innerJoin(users, eq(users.id, teamMembers.userId))
      .where(eq(teamMembers.teamId, teamId));

    return members;
  }

  async updateUserProfile(userId: string, profileData: { name?: string; school?: string | null; bio?: string | null; skills?: string; }): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }
}

export const storage = new DatabaseStorage();
