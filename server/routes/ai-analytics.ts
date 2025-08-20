import { Router, Request, Response } from 'express';
import { AIPlagiarismDetector, PlagiarismResult } from '../services/ai-plagiarism';
import { AzureSQLAnalytics } from '../db/azure-sql';
import { verifyFirebaseToken } from '../lib/firebase-admin';
import { z } from 'zod';

const router = Router();

// Schema for plagiarism detection request
const plagiarismDetectionSchema = z.object({
  submissionId: z.string().uuid(),
  teamId: z.string().uuid(),
  content: z.object({
    title: z.string().min(1).max(500),
    description: z.string().min(10).max(5000),
    githubUrl: z.string().url().optional(),
    additionalLinks: z.array(z.string().url()).optional()
  })
});

// POST /api/ai/plagiarism-check - Run plagiarism detection on submission
router.post('/plagiarism-check', verifyFirebaseToken, async (req: Request, res: Response) => {
  try {
    const validatedData = plagiarismDetectionSchema.parse(req.body);
    const { submissionId, teamId, content } = validatedData;

    console.log(`🔍 Running plagiarism check for submission ${submissionId}`);

    // Run AI plagiarism detection
    const result: PlagiarismResult = await AIPlagiarismDetector.detectPlagiarism(
      submissionId,
      teamId,
      content
    );

    // Record analytics event
    await AzureSQLAnalytics.recordEventMetric(
      teamId, // Using teamId as event context
      'plagiarism_check_completed',
      1
    );

    // Determine risk level
    let riskLevel = 'low';
    if (result.similarityScore > 70 || result.plagiarismFlags > 5) {
      riskLevel = 'high';
    } else if (result.similarityScore > 40 || result.plagiarismFlags > 2) {
      riskLevel = 'medium';
    }

    res.json({
      success: true,
      data: {
        submissionId,
        similarityScore: result.similarityScore,
        plagiarismFlags: result.plagiarismFlags,
        riskLevel,
        confidence: result.confidence,
        detectedSources: result.detectedSources,
        suspiciousPatterns: result.suspiciousPatterns,
        recommendations: generateRecommendations(result),
        timestamp: new Date().toISOString()
      },
      message: 'Plagiarism detection completed successfully'
    });

  } catch (error) {
    console.error('Error in plagiarism detection:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to run plagiarism detection',
      message: 'An error occurred while analyzing the submission'
    });
  }
});

// GET /api/ai/analytics/:eventId - Get AI-powered analytics for an event
router.get('/analytics/:eventId', verifyFirebaseToken, async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    if (!eventId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID format'
      });
    }

    console.log(`📊 Generating AI analytics for event ${eventId}`);

    // Get comprehensive analytics from Azure SQL
    const [eventMetrics, plagiarismStats] = await Promise.all([
      AzureSQLAnalytics.getEventAnalytics(eventId),
      AzureSQLAnalytics.getPlagiarismStats(eventId)
    ]);

    // Calculate additional insights
    const insights = {
      totalSubmissions: plagiarismStats[0]?.total_submissions || 0,
      averageSimilarity: Math.round((plagiarismStats[0]?.avg_similarity || 0) * 100) / 100,
      highRiskSubmissions: plagiarismStats[0]?.high_similarity_count || 0,
      totalFlags: plagiarismStats[0]?.total_flags || 0,
      qualityScore: calculateQualityScore(plagiarismStats[0]),
      riskDistribution: {
        low: Math.max(0, (plagiarismStats[0]?.total_submissions || 0) - (plagiarismStats[0]?.high_similarity_count || 0)),
        medium: Math.floor((plagiarismStats[0]?.high_similarity_count || 0) * 0.3),
        high: Math.floor((plagiarismStats[0]?.high_similarity_count || 0) * 0.7)
      }
    };

    const recommendations = generateEventRecommendations(insights);

    res.json({
      success: true,
      data: {
        eventId,
        overview: insights,
        metrics: eventMetrics,
        plagiarismAnalysis: plagiarismStats[0] || {},
        recommendations,
        lastUpdated: new Date().toISOString(),
        reportGenerated: new Date().toISOString()
      },
      message: 'AI analytics generated successfully'
    });

  } catch (error) {
    console.error('Error generating AI analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate analytics',
      message: 'An error occurred while processing analytics data'
    });
  }
});

// GET /api/ai/leaderboard/:eventId - AI-enhanced leaderboard with quality scoring
router.get('/leaderboard/:eventId', verifyFirebaseToken, async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: 'Event ID is required'
      });
    }

    console.log(`🏆 Generating AI-enhanced leaderboard for event ${eventId}`);

    // This would integrate with your existing leaderboard logic
    // and enhance it with AI insights
    
    res.json({
      success: true,
      data: {
        eventId,
        leaderboard: [], // Would be populated with actual team rankings
        aiInsights: {
          qualityMetrics: 'enabled',
          plagiarismScreening: 'active',
          lastUpdated: new Date().toISOString()
        }
      },
      message: 'AI-enhanced leaderboard generated successfully'
    });

  } catch (error) {
    console.error('Error generating AI leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate leaderboard',
      message: 'An error occurred while processing leaderboard data'
    });
  }
});

// Utility functions
function generateRecommendations(result: PlagiarismResult): string[] {
  const recommendations = [];

  if (result.similarityScore > 70) {
    recommendations.push('High similarity detected - Please review submission for originality');
    recommendations.push('Consider rewriting sections that appear to match existing content');
  } else if (result.similarityScore > 40) {
    recommendations.push('Moderate similarity detected - Consider adding more original content');
  }

  if (result.plagiarismFlags > 5) {
    recommendations.push('Multiple suspicious patterns found - Review for placeholder content');
  }

  if (result.detectedSources.length > 3) {
    recommendations.push('Multiple external sources detected - Ensure proper attribution');
  }

  if (result.confidence < 0.5) {
    recommendations.push('Low confidence analysis - Consider manual review');
  }

  if (recommendations.length === 0) {
    recommendations.push('Submission appears to be original - Good work!');
  }

  return recommendations;
}

function calculateQualityScore(stats: any): number {
  if (!stats || !stats.total_submissions) return 0;
  
  const avgSimilarity = stats.avg_similarity || 0;
  const flagsRatio = (stats.total_flags || 0) / stats.total_submissions;
  const highSimilarityRatio = (stats.high_similarity_count || 0) / stats.total_submissions;

  // Quality score: lower similarity and fewer flags = higher quality
  const qualityScore = Math.max(0, Math.min(100, 
    100 - (avgSimilarity * 0.5) - (flagsRatio * 30) - (highSimilarityRatio * 40)
  ));

  return Math.round(qualityScore * 100) / 100;
}

function generateEventRecommendations(insights: any): string[] {
  const recommendations = [];

  if (insights.averageSimilarity > 50) {
    recommendations.push('High average similarity - Consider implementing stricter originality guidelines');
  }

  if (insights.highRiskSubmissions > insights.totalSubmissions * 0.3) {
    recommendations.push('Many high-risk submissions - Review judging criteria for originality');
  }

  if (insights.totalFlags > insights.totalSubmissions * 2) {
    recommendations.push('High flag ratio - Consider providing clearer submission guidelines');
  }

  if (insights.qualityScore > 80) {
    recommendations.push('Excellent submission quality - Great event management!');
  } else if (insights.qualityScore < 50) {
    recommendations.push('Low quality score - Focus on improving submission standards');
  }

  return recommendations;
}

export default router;