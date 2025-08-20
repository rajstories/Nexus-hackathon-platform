import { Router } from 'express';
import { sentimentService } from '../lib/sentimentService';
import { verifyFirebaseToken, requireRole } from '../lib/firebase-admin';

const router = Router();

// Analyze sentiment of a single message (for real-time analysis)
router.post('/analyze-message', verifyFirebaseToken, async (req, res) => {
  try {
    const { messageId, userId, userName, content, timestamp } = req.body;

    if (!messageId || !userId || !userName || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['messageId', 'userId', 'userName', 'content']
      });
    }

    const analysis = sentimentService.analyzeMessage(
      messageId,
      userId,
      userName,
      content,
      timestamp ? new Date(timestamp) : new Date()
    );

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Message sentiment analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze message sentiment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get comprehensive sentiment analysis for an event (organizer only)
router.get('/event/:eventId', verifyFirebaseToken, requireRole(['organizer']), async (req, res) => {
  try {
    const { eventId } = req.params;

    const analysis = await sentimentService.analyzeEventSentiment(eventId);

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Event sentiment analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze event sentiment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get flagged messages that need moderation (organizer/judge only)
router.get('/flagged/:eventId', verifyFirebaseToken, requireRole(['organizer', 'judge']), async (req, res) => {
  try {
    const { eventId } = req.params;

    const eventAnalysis = await sentimentService.analyzeEventSentiment(eventId);

    res.json({
      success: true,
      flaggedMessages: eventAnalysis.flaggedMessages,
      totalFlagged: eventAnalysis.flaggedMessages.length,
      toxicityLevel: eventAnalysis.toxicityLevel
    });

  } catch (error) {
    console.error('Get flagged messages error:', error);
    res.status(500).json({
      error: 'Failed to get flagged messages',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get positive highlights from chat (for showcasing community engagement)
router.get('/highlights/:eventId', verifyFirebaseToken, async (req, res) => {
  try {
    const { eventId } = req.params;

    const eventAnalysis = await sentimentService.analyzeEventSentiment(eventId);

    res.json({
      success: true,
      highlights: eventAnalysis.topPositiveMessages,
      overallSentiment: eventAnalysis.averageSentiment,
      positiveRatio: eventAnalysis.positiveRatio,
      helpfulnessLevel: eventAnalysis.helpfulnessLevel
    });

  } catch (error) {
    console.error('Get sentiment highlights error:', error);
    res.status(500).json({
      error: 'Failed to get sentiment highlights',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get emotion breakdown for event (for advanced analytics)
router.get('/emotions/:eventId', verifyFirebaseToken, requireRole(['organizer']), async (req, res) => {
  try {
    const { eventId } = req.params;

    const eventAnalysis = await sentimentService.analyzeEventSentiment(eventId);

    res.json({
      success: true,
      emotions: eventAnalysis.emotionalBreakdown,
      totalMessages: eventAnalysis.totalMessages,
      sentimentDistribution: {
        positive: eventAnalysis.positiveRatio,
        negative: eventAnalysis.negativeRatio,
        neutral: eventAnalysis.neutralRatio
      }
    });

  } catch (error) {
    console.error('Get emotion breakdown error:', error);
    res.status(500).json({
      error: 'Failed to get emotion breakdown',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;