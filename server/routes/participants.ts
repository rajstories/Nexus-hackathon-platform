import { Router } from "express";
import { z } from "zod";
import { verifyFirebaseToken, type AuthenticatedRequest, requireRole } from "../lib/firebase-admin";
import { db } from "../db";
import { participantProfiles, hackathonRegistrations, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { Response } from "express";

const router = Router();

// Registration schema for validation
const registrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  mobile: z.string().min(10, "Valid mobile number is required"),
  countryCode: z.string().default("+91"),
  gender: z.string().min(1, "Gender selection is required"),
  instituteName: z.string().min(1, "Institute name is required"),
  participantType: z.string().min(1, "Participant type is required"),
  domain: z.string().min(1, "Domain is required"),
  course: z.string().optional(),
  courseSpecialization: z.string().optional(),
  graduatingYear: z.number().optional(),
  courseDuration: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  hackathonId: z.string().min(1, "Hackathon ID is required"),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to terms and conditions"),
});

// POST /api/participants/register - Register participant for a hackathon
router.post('/register', 
  verifyFirebaseToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validatedData = registrationSchema.parse(req.body);
      const userId = req.user!.userId;

      // Check if user already has a participant profile
      let existingProfile = await db
        .select()
        .from(participantProfiles)
        .where(eq(participantProfiles.userId, userId))
        .limit(1);

      let profile;
      if (existingProfile.length > 0) {
        // Update existing profile
        [profile] = await db
          .update(participantProfiles)
          .set({
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            mobile: validatedData.mobile,
            countryCode: validatedData.countryCode,
            gender: validatedData.gender,
            instituteName: validatedData.instituteName,
            participantType: validatedData.participantType,
            domain: validatedData.domain,
            course: validatedData.course,
            courseSpecialization: validatedData.courseSpecialization,
            graduatingYear: validatedData.graduatingYear,
            courseDuration: validatedData.courseDuration,
            location: validatedData.location,
            updatedAt: new Date(),
          })
          .where(eq(participantProfiles.userId, userId))
          .returning();
      } else {
        // Create new profile
        [profile] = await db
          .insert(participantProfiles)
          .values({
            userId,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            mobile: validatedData.mobile,
            countryCode: validatedData.countryCode,
            gender: validatedData.gender,
            instituteName: validatedData.instituteName,
            participantType: validatedData.participantType,
            domain: validatedData.domain,
            course: validatedData.course,
            courseSpecialization: validatedData.courseSpecialization,
            graduatingYear: validatedData.graduatingYear,
            courseDuration: validatedData.courseDuration,
            location: validatedData.location,
          })
          .returning();
      }

      // Get hackathon title from the hardcoded hackathons data
      const hackathons = [
        { id: "1", title: "AI Hackathon for Product Management" },
        { id: "2", title: "Swasth-a-thon" },
        { id: "3", title: "Sprintathon'25" },
        { id: "4", title: "YuvaHacks '25" },
        { id: "5", title: "Fintech Innovation Challenge" },
      ];
      
      const hackathon = hackathons.find(h => h.id === validatedData.hackathonId);
      const hackathonTitle = hackathon?.title || "Unknown Hackathon";

      // Check if already registered for this hackathon
      const existingRegistration = await db
        .select()
        .from(hackathonRegistrations)
        .where(eq(hackathonRegistrations.userId, userId))
        .where(eq(hackathonRegistrations.hackathonId, validatedData.hackathonId))
        .limit(1);

      let registration;
      if (existingRegistration.length > 0) {
        // Update existing registration
        [registration] = await db
          .update(hackathonRegistrations)
          .set({
            hackathonTitle,
            registrationData: JSON.stringify(validatedData),
            status: "registered",
          })
          .where(eq(hackathonRegistrations.userId, userId))
          .where(eq(hackathonRegistrations.hackathonId, validatedData.hackathonId))
          .returning();
      } else {
        // Create new registration
        [registration] = await db
          .insert(hackathonRegistrations)
          .values({
            userId,
            hackathonId: validatedData.hackathonId,
            hackathonTitle,
            registrationData: JSON.stringify(validatedData),
            status: "registered",
          })
          .returning();
      }

      res.status(200).json({
        success: true,
        message: "Registration successful",
        data: {
          profile,
          registration,
        },
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Please check your form data',
          details: error.errors,
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to register for hackathon',
      });
    }
  }
);

// GET /api/participants/profile - Get participant profile
router.get('/profile',
  verifyFirebaseToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;

      // Get user profile with participant details
      const userWithProfile = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          profile: participantProfiles,
        })
        .from(users)
        .leftJoin(participantProfiles, eq(users.id, participantProfiles.userId))
        .where(eq(users.id, userId))
        .limit(1);

      if (userWithProfile.length === 0) {
        return res.status(404).json({
          error: 'Not found',
          message: 'User not found',
        });
      }

      const [userProfile] = userWithProfile;

      res.status(200).json({
        success: true,
        data: userProfile,
      });

    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch profile',
      });
    }
  }
);

// GET /api/participants/registrations - Get participant's hackathon registrations
router.get('/registrations',
  verifyFirebaseToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;

      const registrations = await db
        .select()
        .from(hackathonRegistrations)
        .where(eq(hackathonRegistrations.userId, userId))
        .orderBy(hackathonRegistrations.registeredAt);

      res.status(200).json({
        success: true,
        data: registrations,
      });

    } catch (error) {
      console.error('Registrations fetch error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch registrations',
      });
    }
  }
);

export default router;