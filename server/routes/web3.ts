import { Router } from 'express';
import { web3Service } from '../lib/web3Service';
import { verifyFirebaseToken, requireRole } from '../lib/firebase-admin';
import { db } from '../db';
import { events, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Generate dynamic POAP badge image
router.get('/badge-image', async (req, res) => {
  try {
    const { name, role, event, title, rank } = req.query;

    // Create SVG badge dynamically
    const roleColors = {
      winner: '#FFD700',
      judge: '#9333EA',
      organizer: '#0EA5E9',
      participant: '#10B981'
    };

    const color = roleColors[role as keyof typeof roleColors] || roleColors.participant;

    const svg = `
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${color}" />
            <stop offset="100%" stop-color="${color}CC" />
          </linearGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" blur="8" flood-color="rgba(0,0,0,0.3)"/>
          </filter>
        </defs>
        
        <!-- Background Circle -->
        <circle cx="200" cy="200" r="180" fill="url(#bg)" filter="url(#shadow)"/>
        
        <!-- Inner Circle -->
        <circle cx="200" cy="200" r="150" fill="none" stroke="white" stroke-width="3" opacity="0.7"/>
        
        <!-- Badge Icon -->
        <g transform="translate(200, 120)">
          ${role === 'winner' ? `
            <polygon points="0,-30 8,-10 30,-10 15,5 20,25 0,15 -20,25 -15,5 -30,-10 -8,-10" fill="white"/>
          ` : role === 'judge' ? `
            <rect x="-15" y="-15" width="30" height="30" rx="5" fill="white"/>
            <rect x="-10" y="-10" width="20" height="20" rx="3" fill="${color}"/>
          ` : role === 'organizer' ? `
            <circle cx="0" cy="0" r="20" fill="white"/>
            <rect x="-15" y="-3" width="30" height="6" fill="${color}"/>
            <rect x="-3" y="-15" width="6" height="30" fill="${color}"/>
          ` : `
            <circle cx="0" cy="0" r="20" fill="white"/>
            <circle cx="0" cy="0" r="12" fill="${color}"/>
          `}
        </g>
        
        <!-- Event Title -->
        <text x="200" y="190" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">
          ${String(title).substring(0, 25)}
        </text>
        
        <!-- Participant Name -->
        <text x="200" y="220" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">
          ${String(name).substring(0, 20)}
        </text>
        
        <!-- Role -->
        <text x="200" y="250" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" text-transform="uppercase" opacity="0.9">
          ${String(role).toUpperCase()}
        </text>
        
        ${rank ? `
          <!-- Rank -->
          <text x="200" y="280" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" opacity="0.8">
            Rank #${rank}
          </text>
        ` : ''}
        
        <!-- Bottom Text -->
        <text x="200" y="320" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" opacity="0.7">
          HackerSpace POAP
        </text>
        
        <!-- Date -->
        <text x="200" y="340" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10" opacity="0.6">
          ${new Date().getFullYear()}
        </text>
      </svg>
    `;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(svg);

  } catch (error) {
    console.error('Badge image generation error:', error);
    res.status(500).json({ error: 'Failed to generate badge image' });
  }
});

// Mint POAP for individual participant
router.post('/mint-poap', verifyFirebaseToken, async (req, res) => {
  try {
    const {
      eventId,
      participantEmail,
      walletAddress,
      achievementTitle,
      role = 'participant',
      rank
    } = req.body;

    // Get event details
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get participant details
    const [participant] = await db
      .select()
      .from(users)
      .where(eq(users.email, participantEmail))
      .limit(1);

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    // Mint POAP
    const result = await web3Service.mintPOAP({
      eventId,
      participantName: participant.name,
      participantEmail,
      role,
      achievementTitle: achievementTitle || event.title,
      rank,
      walletAddress
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'POAP minted successfully',
        tokenId: result.tokenId,
        transactionHash: result.transactionHash,
        metadataUri: result.metadataUri
      });
    } else {
      res.status(400).json({
        error: 'Failed to mint POAP',
        message: result.error
      });
    }

  } catch (error) {
    console.error('Mint POAP error:', error);
    res.status(500).json({
      error: 'Failed to mint POAP',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Batch mint POAPs for event participants
router.post('/batch-mint', verifyFirebaseToken, requireRole(['organizer']), async (req, res) => {
  try {
    const { eventId, mintType = 'all' } = req.body; // 'all', 'winners', 'participants', 'judges'

    // Get event details
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Collect participants based on mint type
    const participantsList = [];

    if (mintType === 'all' || mintType === 'participants') {
      // Get all participants (mock data for now - in real app would query teams/participants)
      const mockParticipants = [
        { name: 'Alice Johnson', email: 'alice@example.com', role: 'participant' as const },
        { name: 'Bob Smith', email: 'bob@example.com', role: 'participant' as const },
        { name: 'Charlie Brown', email: 'charlie@example.com', role: 'participant' as const }
      ];
      
      participantsList.push(...mockParticipants.map(p => ({
        eventId,
        participantName: p.name,
        participantEmail: p.email,
        role: p.role,
        achievementTitle: event.title,
        walletAddress: web3Service.generateWalletAddress()
      })));
    }

    if (mintType === 'all' || mintType === 'winners') {
      // Add winners (mock data)
      participantsList.push({
        eventId,
        participantName: 'Winner Team Lead',
        participantEmail: 'winner@example.com',
        role: 'winner' as const,
        achievementTitle: `${event.title} - 1st Place`,
        rank: 1,
        walletAddress: web3Service.generateWalletAddress()
      });
    }

    if (mintType === 'all' || mintType === 'judges') {
      // Add judges (mock data)
      participantsList.push({
        eventId,
        participantName: 'Judge Expert',
        participantEmail: 'judge@example.com',
        role: 'judge' as const,
        achievementTitle: event.title,
        walletAddress: web3Service.generateWalletAddress()
      });
    }

    // Batch mint POAPs
    const result = await web3Service.batchMintPOAPs(participantsList);

    res.json({
      success: true,
      message: `Batch minting completed: ${result.successful} successful, ${result.failed} failed`,
      summary: {
        total: participantsList.length,
        successful: result.successful,
        failed: result.failed
      },
      results: result.results
    });

  } catch (error) {
    console.error('Batch mint error:', error);
    res.status(500).json({
      error: 'Failed to batch mint POAPs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get event POAP collection
router.get('/event/:eventId/poaps', verifyFirebaseToken, async (req, res) => {
  try {
    const { eventId } = req.params;

    const result = await web3Service.getEventPOAPs(eventId);

    if (result.success) {
      res.json({
        success: true,
        eventId,
        totalPOAPs: result.tokens?.length || 0,
        tokens: result.tokens
      });
    } else {
      res.status(400).json({
        error: 'Failed to get event POAPs',
        message: result.error
      });
    }

  } catch (error) {
    console.error('Get event POAPs error:', error);
    res.status(500).json({
      error: 'Failed to get event POAPs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Check Web3 configuration status
router.get('/status', verifyFirebaseToken, requireRole(['organizer']), async (req, res) => {
  res.json({
    configured: web3Service.isConfigured(),
    features: {
      mintPOAP: true,
      batchMint: true,
      dynamicBadges: true,
      ipfsStorage: true
    },
    network: process.env.WEB3_RPC_URL ? 'Polygon Mumbai Testnet' : 'Mock Network (Demo Mode)',
    contract: process.env.WEB3_CONTRACT_ADDRESS || 'Mock Contract'
  });
});

export default router;