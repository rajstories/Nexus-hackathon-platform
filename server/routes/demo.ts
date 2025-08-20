import { Router } from 'express';
import { seedDemoData } from '../../scripts/demo';

const router = Router();

// POST /api/demo/start - Start the demo (public endpoint for demo purposes)
router.post('/start', async (req, res) => {
  try {
    console.log('🚀 Starting demo...');
    
    // Seed demo data
    const demoData = await seedDemoData();
    
    // Return demo info
    res.status(200).json({
      success: true,
      message: 'Demo started successfully',
      data: {
        event: {
          id: demoData.event.id,
          title: demoData.event.title,
          startAt: demoData.event.startAt,
          endAt: demoData.event.endAt
        },
        organizer: {
          firebaseUid: 'demo_organizer',
          email: 'organizer@demo.hackathon'
        },
        judges: demoData.judges.map((j, i) => ({
          firebaseUid: `demo_judge_${i + 1}`,
          email: `judge${i + 1}@demo.hackathon`,
          name: j.name
        })),
        stats: {
          participants: demoData.participants.length,
          teams: demoData.teams.length,
          submissions: demoData.submissions.length,
          judges: demoData.judges.length
        }
      }
    });

  } catch (error) {
    console.error('Demo start error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start demo',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/demo/status - Check if demo data exists
router.get('/status', async (req, res) => {
  try {
    // Check if demo data exists by looking for demo_organizer
    const { db } = await import('../db');
    const { users, events } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [demoOrganizer] = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, 'demo_organizer'))
      .limit(1);
    
    if (!demoOrganizer) {
      return res.json({
        success: true,
        demoActive: false,
        message: 'No demo data found'
      });
    }
    
    const [demoEvent] = await db
      .select()
      .from(events)
      .where(eq(events.organizerId, demoOrganizer.id))
      .limit(1);
    
    res.json({
      success: true,
      demoActive: true,
      event: demoEvent ? {
        id: demoEvent.id,
        title: demoEvent.title
      } : null
    });
    
  } catch (error) {
    console.error('Demo status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check demo status'
    });
  }
});

export default router;