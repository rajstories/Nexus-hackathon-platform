import { db } from '../db';
import { scores, rubricCriteria, rubrics, submissions } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { FeedbackSummary } from '../db/models/FeedbackSummary';

interface RubricBreakdown {
  criteria_key: string;
  label: string;
  description: string;
  weight: number;
  average_score: number;
  weighted_score: number;
}

interface FeedbackResult {
  summary: string[];
  next_steps: string[];
}

/**
 * Generates automated feedback summary for a submission based on rubric scores
 */
export class FeedbackSummaryService {
  
  /**
   * Get cached feedback summary from MongoDB or generate new one
   */
  static async getFeedbackSummary(submissionId: string): Promise<FeedbackResult | null> {
    try {
      // Check cache first
      const cached = await FeedbackSummary.findOne({ submission_id: submissionId });
      if (cached) {
        return {
          summary: cached.summary,
          next_steps: cached.next_steps
        };
      }

      // Generate new summary
      const result = await this.generateFeedbackSummary(submissionId);
      if (!result) return null;

      // Cache the result
      await FeedbackSummary.findOneAndUpdate(
        { submission_id: submissionId },
        {
          submission_id: submissionId,
          summary: result.summary,
          next_steps: result.next_steps,
          updated_at: new Date()
        },
        { upsert: true, new: true }
      );

      return result;
    } catch (error) {
      console.error('Error getting feedback summary:', error);
      return null;
    }
  }

  /**
   * Generate feedback summary based on rubric breakdown
   */
  private static async generateFeedbackSummary(submissionId: string): Promise<FeedbackResult | null> {
    try {
      // Get submission details
      const submission = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, submissionId))
        .limit(1);

      if (!submission.length) {
        return null;
      }

      // Get rubric for the event
      const rubric = await db
        .select()
        .from(rubrics)
        .where(eq(rubrics.eventId, submission[0].eventId))
        .limit(1);

      if (!rubric.length) {
        return null;
      }

      // Get all criteria for this rubric
      const criteria = await db
        .select()
        .from(rubricCriteria)
        .where(eq(rubricCriteria.rubricId, rubric[0].id))
        .orderBy(rubricCriteria.displayOrder);

      if (!criteria.length) {
        return null;
      }

      // Get all scores for this submission
      const submissionScores = await db
        .select({
          rubricCriteriaId: scores.rubricCriteriaId,
          criteriaId: scores.criteriaId,
          score: scores.score,
        })
        .from(scores)
        .where(eq(scores.submissionId, submissionId));

      if (!submissionScores.length) {
        return null;
      }

      // Calculate rubric breakdown
      const breakdown = this.calculateRubricBreakdown(criteria, submissionScores);
      
      // Generate feedback based on bottom 2 criteria
      return this.generateFeedbackFromBreakdown(breakdown);
    } catch (error) {
      console.error('Error generating feedback summary:', error);
      return null;
    }
  }

  /**
   * Calculate weighted scores for each criteria
   */
  private static calculateRubricBreakdown(criteria: any[], submissionScores: any[]): RubricBreakdown[] {
    return criteria.map(criterion => {
      // Find scores for this criterion
      const criterionScores = submissionScores.filter(
        score => score.rubricCriteriaId === criterion.id || score.criteriaId === criterion.id
      );

      let averageScore = 0;
      if (criterionScores.length > 0) {
        const totalScore = criterionScores.reduce((sum, score) => sum + parseFloat(score.score), 0);
        averageScore = totalScore / criterionScores.length;
      }

      const weightedScore = averageScore * criterion.weight;

      return {
        criteria_key: criterion.key,
        label: criterion.label,
        description: criterion.description || '',
        weight: criterion.weight,
        average_score: averageScore,
        weighted_score: weightedScore
      };
    });
  }

  /**
   * Generate feedback summary from rubric breakdown
   */
  private static generateFeedbackFromBreakdown(breakdown: RubricBreakdown[]): FeedbackResult {
    // Sort by weighted score to find bottom 2 criteria
    const sortedCriteria = breakdown.sort((a, b) => a.weighted_score - b.weighted_score);
    const bottomTwo = sortedCriteria.slice(0, 2);

    // Generate summary bullets based on lowest-scoring criteria
    const summary = this.generateSummaryBullets(bottomTwo);
    
    // Generate actionable next steps from criteria descriptions
    const nextSteps = this.generateNextSteps(bottomTwo);

    return {
      summary,
      next_steps: nextSteps
    };
  }

  /**
   * Generate 2-3 template-based summary bullets
   */
  private static generateSummaryBullets(bottomCriteria: RubricBreakdown[]): string[] {
    const bullets: string[] = [];

    bottomCriteria.forEach((criterion, index) => {
      const scorePercentage = Math.round((criterion.average_score / 10) * 100); // Assuming 10-point scale
      
      if (index === 0) {
        // Primary weakness
        bullets.push(`Primary concern: ${criterion.label} scored ${scorePercentage}% (${criterion.average_score.toFixed(1)}/10), indicating significant room for improvement in this critical area.`);
      } else {
        // Secondary weakness
        bullets.push(`Secondary area for improvement: ${criterion.label} received ${scorePercentage}% (${criterion.average_score.toFixed(1)}/10), suggesting additional focus needed.`);
      }
    });

    // Add overall summary if we have both criteria
    if (bottomCriteria.length >= 2) {
      const totalWeightedScore = bottomCriteria.reduce((sum, c) => sum + c.weighted_score, 0);
      const totalWeight = bottomCriteria.reduce((sum, c) => sum + c.weight, 0);
      const overallPercentage = Math.round((totalWeightedScore / (totalWeight * 10)) * 100);
      
      bullets.push(`Combined performance in these key areas reached ${overallPercentage}%, falling below the expected standards for this evaluation.`);
    }

    return bullets.slice(0, 3); // Limit to 3 bullets max
  }

  /**
   * Generate 3 actionable next steps from criteria descriptions
   */
  private static generateNextSteps(bottomCriteria: RubricBreakdown[]): string[] {
    const nextSteps: string[] = [];

    bottomCriteria.forEach(criterion => {
      if (criterion.description && criterion.description.trim()) {
        // Extract actionable guidance from description
        const actionableStep = this.extractActionableStep(criterion.label, criterion.description);
        nextSteps.push(actionableStep);
      } else {
        // Fallback generic advice based on criterion label
        nextSteps.push(this.generateGenericStep(criterion.label));
      }
    });

    // Add a general improvement step if we have less than 3
    if (nextSteps.length < 3) {
      nextSteps.push("Review successful submissions in similar categories to identify best practices and implementation patterns.");
    }

    return nextSteps.slice(0, 3); // Limit to exactly 3 steps
  }

  /**
   * Extract actionable step from criteria description
   */
  private static extractActionableStep(label: string, description: string): string {
    // Simple template-based extraction
    const actionPrefixes = [
      "Consider improving",
      "Focus on enhancing",
      "Work on strengthening",
      "Prioritize developing"
    ];
    
    const randomPrefix = actionPrefixes[Math.floor(Math.random() * actionPrefixes.length)];
    
    // Clean up description and make it actionable
    const cleanDescription = description.toLowerCase().trim();
    
    if (cleanDescription.length > 100) {
      // Truncate long descriptions
      const truncated = cleanDescription.substring(0, 97) + "...";
      return `${randomPrefix} ${label.toLowerCase()}: ${truncated}`;
    }
    
    return `${randomPrefix} ${label.toLowerCase()}: ${cleanDescription}`;
  }

  /**
   * Generate generic improvement step when description is not available
   */
  private static generateGenericStep(label: string): string {
    const genericTemplates = [
      `Dedicate additional time to improving ${label.toLowerCase()} through research and iteration.`,
      `Seek feedback and resources specifically focused on ${label.toLowerCase()} enhancement.`,
      `Analyze high-performing examples to understand best practices for ${label.toLowerCase()}.`
    ];
    
    return genericTemplates[Math.floor(Math.random() * genericTemplates.length)];
  }
}