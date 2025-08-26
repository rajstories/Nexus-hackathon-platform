import { db } from '../db';
import { eventReviews, teamMembers, teams, judgeAssignments, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { ReviewFlag, IReviewFlag } from '../db/models/ReviewFlag';

interface ReviewData {
  id: string;
  rating: number;
  userId: string;
  eventId: string;
  role: string;
}

interface FlaggedReview {
  reviewId: string;
  reason: string;
  score?: number;
  metadata?: any;
  createdAt: Date;
}

export class ReviewFlaggingService {
  /**
   * Calculate Median Absolute Deviation (MAD) z-score for outlier detection
   */
  private static calculateMADZScore(ratings: number[]): { madZScores: number[], median: number, mad: number } {
    if (ratings.length === 0) {
      return { madZScores: [], median: 0, mad: 0 };
    }

    // Calculate median
    const sorted = [...ratings].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    // Calculate MAD (Median Absolute Deviation)
    const deviations = ratings.map(rating => Math.abs(rating - median));
    const sortedDeviations = deviations.sort((a, b) => a - b);
    const mad = sortedDeviations.length % 2 === 0
      ? (sortedDeviations[sortedDeviations.length / 2 - 1] + sortedDeviations[sortedDeviations.length / 2]) / 2
      : sortedDeviations[Math.floor(sortedDeviations.length / 2)];

    // Calculate MAD z-scores (using 1.4826 as the normalization constant)
    const madZScores = mad > 0 
      ? ratings.map(rating => (rating - median) / (1.4826 * mad))
      : ratings.map(() => 0);

    return { madZScores, median, mad };
  }

  /**
   * Check if a user is verified for an event (participant, judge, or organizer)
   */
  private static async isUserVerifiedForEvent(eventId: string, userId: string): Promise<{ isVerified: boolean; role?: string }> {
    try {
      // Check if user is a participant (team member with submission)
      const participation = await db
        .select()
        .from(teamMembers)
        .innerJoin(teams, eq(teams.id, teamMembers.teamId))
        .where(
          and(
            eq(teamMembers.userId, userId),
            eq(teams.eventId, eventId)
          )
        )
        .limit(1);

      if (participation.length) {
        return { isVerified: true, role: 'participant' };
      }

      // Check if user is a judge
      const judgeAssignment = await db
        .select()
        .from(judgeAssignments)
        .where(
          and(
            eq(judgeAssignments.eventId, eventId),
            eq(judgeAssignments.judgeId, userId)
          )
        )
        .limit(1);

      if (judgeAssignment.length) {
        return { isVerified: true, role: 'judge' };
      }

      return { isVerified: false };
    } catch (error) {
      console.error('Error verifying user for event:', error);
      return { isVerified: false };
    }
  }

  /**
   * Flag outlier reviews based on MAD z-score analysis
   */
  static async flagOutlierReviews(eventId: string): Promise<void> {
    try {
      // Get all reviews for the event
      const reviews = await db
        .select({
          id: eventReviews.id,
          rating: eventReviews.rating,
          userId: eventReviews.userId,
          eventId: eventReviews.eventId,
          role: eventReviews.role,
        })
        .from(eventReviews)
        .where(eq(eventReviews.eventId, eventId));

      if (reviews.length < 3) {
        // Need at least 3 reviews for meaningful outlier detection
        return;
      }

      const ratings = reviews.map(r => r.rating);
      const { madZScores, median } = this.calculateMADZScore(ratings);

      // Flag reviews with |z-score| >= 3
      for (let i = 0; i < reviews.length; i++) {
        const review = reviews[i];
        const madZScore = madZScores[i];

        if (Math.abs(madZScore) >= 3) {
          await this.createFlag({
            reviewId: review.id,
            reason: 'outlier_rating',
            score: Math.abs(madZScore),
            metadata: {
              madScore: madZScore,
              eventAverageRating: median,
              userRole: review.role,
              detectionMethod: 'MAD_zscore',
            },
          });
        }
      }
    } catch (error) {
      console.error('Error flagging outlier reviews:', error);
      throw error;
    }
  }

  /**
   * Flag reviews from invalid users (not participants/judges)
   */
  static async flagInvalidUserReviews(eventId: string): Promise<void> {
    try {
      // Get all reviews for the event
      const reviews = await db
        .select({
          id: eventReviews.id,
          userId: eventReviews.userId,
          eventId: eventReviews.eventId,
          role: eventReviews.role,
        })
        .from(eventReviews)
        .where(eq(eventReviews.eventId, eventId));

      for (const review of reviews) {
        const { isVerified, role } = await this.isUserVerifiedForEvent(eventId, review.userId);
        
        if (!isVerified) {
          await this.createFlag({
            reviewId: review.id,
            reason: 'invalid_user',
            metadata: {
              userRole: review.role,
              detectionMethod: 'user_verification',
            },
          });
        }
      }
    } catch (error) {
      console.error('Error flagging invalid user reviews:', error);
      throw error;
    }
  }

  /**
   * Create a review flag
   */
  private static async createFlag(flagData: {
    reviewId: string;
    reason: 'outlier_rating' | 'invalid_user' | 'suspicious_pattern';
    score?: number;
    metadata?: any;
  }): Promise<void> {
    try {
      // Use upsert to avoid duplicate flags
      await ReviewFlag.findOneAndUpdate(
        { 
          reviewId: flagData.reviewId, 
          reason: flagData.reason 
        },
        {
          $set: {
            ...flagData,
            updatedAt: new Date(),
          }
        },
        { 
          upsert: true, 
          new: true 
        }
      );
    } catch (error: any) {
      if (error.code === 11000) {
        // Duplicate key error - flag already exists, ignore
        return;
      }
      throw error;
    }
  }

  /**
   * Get flagged reviews for an event
   */
  static async getFlaggedReviews(eventId: string): Promise<FlaggedReview[]> {
    try {
      // Get all review IDs for the event
      const eventReviewIds = await db
        .select({ id: eventReviews.id })
        .from(eventReviews)
        .where(eq(eventReviews.eventId, eventId));

      const reviewIds = eventReviewIds.map(r => r.id);

      if (reviewIds.length === 0) {
        return [];
      }

      // Get flags for these reviews
      const flags = await ReviewFlag.find({
        reviewId: { $in: reviewIds }
      }).sort({ createdAt: -1 });

      return flags.map(flag => ({
        reviewId: flag.reviewId,
        reason: flag.reason,
        score: flag.score,
        metadata: flag.metadata,
        createdAt: flag.createdAt,
      }));
    } catch (error) {
      console.error('Error getting flagged reviews:', error);
      throw error;
    }
  }

  /**
   * Run all flagging checks for an event
   */
  static async runFlaggingAnalysis(eventId: string): Promise<void> {
    try {
      await Promise.all([
        this.flagOutlierReviews(eventId),
        this.flagInvalidUserReviews(eventId),
      ]);
    } catch (error) {
      console.error('Error running flagging analysis:', error);
      throw error;
    }
  }

  /**
   * Get flagged reviews with detailed information
   */
  static async getFlaggedReviewsWithDetails(eventId: string): Promise<any[]> {
    try {
      const flags = await this.getFlaggedReviews(eventId);
      
      if (flags.length === 0) {
        return [];
      }

      const reviewIds = flags.map(f => f.reviewId);

      // Get review details
      const reviewDetails = await db
        .select({
          id: eventReviews.id,
          rating: eventReviews.rating,
          body: eventReviews.body,
          role: eventReviews.role,
          createdAt: eventReviews.createdAt,
          userName: users.name,
          userEmail: users.email,
        })
        .from(eventReviews)
        .innerJoin(users, eq(users.id, eventReviews.userId))
        .where(eq(eventReviews.eventId, eventId));

      // Combine flags with review details
      return flags.map(flag => {
        const review = reviewDetails.find(r => r.id === flag.reviewId);
        return {
          flag: {
            reason: flag.reason,
            score: flag.score,
            metadata: flag.metadata,
            flaggedAt: flag.createdAt,
          },
          review: review || null,
        };
      });
    } catch (error) {
      console.error('Error getting flagged reviews with details:', error);
      throw error;
    }
  }
}