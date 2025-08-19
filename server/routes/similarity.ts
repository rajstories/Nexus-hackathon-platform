import express from 'express';
import { verifyFirebaseToken, requireRole } from '../lib/firebase-admin';
import { similarityService } from '../lib/similarityService';

const router = express.Router();

// GET /api/similarity/:eventId - Get similarity analysis results
router.get('/:eventId', verifyFirebaseToken, requireRole(['organizer']), async (req, res) => {
  try {
    const { eventId } = req.params;
    const { analyze } = req.query;
    
    // If analyze=true, run the analysis first
    if (analyze === 'true') {
      console.log(`Running similarity analysis for event ${eventId}`);
      
      const analysisResult = await similarityService.analyzeEventSubmissions(eventId);
      
      console.log(`Analysis complete: ${analysisResult.analyzed} submissions analyzed, ${analysisResult.flagged} flagged`);
      
      return res.json({
        success: true,
        message: 'Similarity analysis completed',
        analyzed: analysisResult.analyzed,
        flagged: analysisResult.flagged,
        results: analysisResult.topPairs.map(pair => ({
          submission1: {
            id: pair.submission1.id,
            title: pair.submission1.title,
            teamName: pair.submission1.teamName,
            snippet: pair.submission1.combinedText.substring(0, 200)
          },
          submission2: {
            id: pair.submission2.id,
            title: pair.submission2.title,
            teamName: pair.submission2.teamName,
            snippet: pair.submission2.combinedText.substring(0, 200)
          },
          similarityScore: pair.score,
          percentageMatch: Math.round(pair.score * 100)
        }))
      });
    }
    
    // Otherwise, get existing results from MongoDB
    const results = await similarityService.getSimilarityResults(eventId);
    
    res.json({
      success: true,
      results: results.map(r => ({
        submission1: {
          id: r.submission1Id,
          title: r.submission1Title,
          teamName: r.submission1TeamName,
          snippet: r.textSnippet1
        },
        submission2: {
          id: r.submission2Id,
          title: r.submission2Title,
          teamName: r.submission2TeamName,
          snippet: r.textSnippet2
        },
        similarityScore: r.similarityScore,
        percentageMatch: Math.round(r.similarityScore * 100),
        detectedAt: r.detectedAt,
        reviewed: r.reviewed,
        reviewedBy: r.reviewedBy,
        reviewNotes: r.reviewNotes
      }))
    });
    
  } catch (error) {
    console.error('Similarity API error:', error);
    res.status(500).json({
      error: 'Failed to get similarity results',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/similarity/:eventId/review - Mark a similarity pair as reviewed
router.post('/:eventId/review', verifyFirebaseToken, requireRole(['organizer']), async (req, res) => {
  try {
    const { eventId } = req.params;
    const { submission1Id, submission2Id, notes } = req.body;
    const reviewerId = req.user?.userId || 'unknown';
    
    const success = await similarityService.markAsReviewed(
      eventId,
      submission1Id,
      submission2Id,
      reviewerId,
      notes
    );
    
    if (success) {
      res.json({
        success: true,
        message: 'Similarity pair marked as reviewed'
      });
    } else {
      res.status(400).json({
        error: 'Failed to mark as reviewed',
        message: 'Pair not found or MongoDB not available'
      });
    }
    
  } catch (error) {
    console.error('Review API error:', error);
    res.status(500).json({
      error: 'Failed to mark as reviewed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;