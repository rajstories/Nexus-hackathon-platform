import express from 'express';
import { CertificateService } from '../lib/certificateService';
import { db } from '../db';

const router = express.Router();
const certificateService = new CertificateService();

// POST /api/certificates - Generate certificate
router.post('/certificates', async (req, res) => {
  try {
    const { name, event, role, date, eventId, userId } = req.body;

    // Validate required fields
    if (!name || !event || !role || !date || !eventId) {
      return res.status(400).json({
        error: 'Missing required fields: name, event, role, date, eventId'
      });
    }

    // Validate role
    if (!['participant', 'judge', 'winner'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role. Must be participant, judge, or winner'
      });
    }

    // Generate the certificate
    const certificateUrl = await certificateService.generateCertificate({
      name,
      event,
      role,
      date,
      eventId,
      userId
    });

    res.json({
      success: true,
      certificateUrl
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({
      error: 'Failed to generate certificate'
    });
  }
});

// GET /api/certificates/check/:teamId - Check certificate eligibility
router.get('/certificates/check/:teamId', async (req, res) => {
  try {
    const teamId = parseInt(req.params.teamId);
    
    // Check if team exists and get their submission status
    const teamResult = await db.execute(
      `SELECT t.*, e.end_time 
       FROM teams t
       LEFT JOIN submissions s ON t.id = s.team_id
       LEFT JOIN events e ON e.id = t.event_id
       WHERE t.id = ${teamId}`
    );

    if (!teamResult.rows || teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const team = teamResult.rows[0] as any;
    const now = new Date();
    const eventEndTime = team.end_time ? new Date(team.end_time) : null;
    
    // Certificate is available if:
    // 1. Event has ended (for now, until we implement finalist tracking)
    const isEligible = (eventEndTime && now > eventEndTime) || true; // Always eligible for demo purposes

    res.json({
      eligible: isEligible,
      isFinalist: false, // Will implement finalist tracking later
      eventEnded: eventEndTime ? now > eventEndTime : false,
      teamName: team.name,
      eventId: team.event_id
    });
  } catch (error) {
    console.error('Error checking certificate eligibility:', error);
    res.status(500).json({
      error: 'Failed to check certificate eligibility'
    });
  }
});

export default router;