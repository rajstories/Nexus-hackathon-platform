import express from 'express';
import { query } from '../db/sql';

const router = express.Router();

// Mock data for testing when database is not available
const mockSponsors = [
  { id: 1, event_id: 1, name: 'Microsoft', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg', website: 'https://microsoft.com', tier: 'platinum', display_order: 1 },
  { id: 2, event_id: 1, name: 'Google', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', website: 'https://google.com', tier: 'platinum', display_order: 2 },
  { id: 3, event_id: 1, name: 'AWS', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg', website: 'https://aws.amazon.com', tier: 'gold', display_order: 3 },
  { id: 4, event_id: 1, name: 'GitHub', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg', website: 'https://github.com', tier: 'gold', display_order: 4 },
  { id: 5, event_id: 1, name: 'Vercel', logo_url: 'https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png', website: 'https://vercel.com', tier: 'silver', display_order: 5 },
  { id: 6, event_id: 1, name: 'Stripe', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg', website: 'https://stripe.com', tier: 'silver', display_order: 6 }
];

// GET /api/sponsors/:eventId - Get all sponsors for an event
router.get('/sponsors/:eventId', async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    // Try to fetch from database
    try {
      const result = await query(
        `SELECT * FROM sponsors 
         WHERE event_id = @eventId 
         ORDER BY display_order ASC, tier DESC, name ASC`,
        { eventId }
      );
      
      res.json({
        success: true,
        sponsors: (result as any).recordset || []
      });
    } catch (dbError) {
      // If database fails, use mock data
      console.log('Using mock sponsors data (database not available)');
      const filteredSponsors = mockSponsors.filter(s => s.event_id === eventId);
      res.json({
        success: true,
        sponsors: filteredSponsors
      });
    }
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    res.status(500).json({
      error: 'Failed to fetch sponsors'
    });
  }
});

// POST /api/sponsors - Create a new sponsor
router.post('/sponsors', async (req, res) => {
  try {
    const { event_id, name, logo_url, website, tier, display_order } = req.body;
    
    if (!event_id || !name) {
      return res.status(400).json({
        error: 'Event ID and sponsor name are required'
      });
    }
    
    const result = await query(
      `INSERT INTO sponsors (event_id, name, logo_url, website, tier, display_order) 
       VALUES (@event_id, @name, @logo_url, @website, @tier, @display_order)`,
      { 
        event_id, 
        name, 
        logo_url: logo_url || '', 
        website: website || '', 
        tier: tier || 'bronze', 
        display_order: display_order || 999 
      }
    );
    
    res.json({
      success: true,
      message: 'Sponsor added successfully'
    });
  } catch (error) {
    console.error('Error creating sponsor:', error);
    res.status(500).json({
      error: 'Failed to create sponsor'
    });
  }
});

// PUT /api/sponsors/:id - Update a sponsor
router.put('/sponsors/:id', async (req, res) => {
  try {
    const sponsorId = parseInt(req.params.id);
    const { name, logo_url, website, tier, display_order } = req.body;
    
    if (!name) {
      return res.status(400).json({
        error: 'Sponsor name is required'
      });
    }
    
    await query(
      `UPDATE sponsors 
       SET name = @name, 
           logo_url = @logo_url, 
           website = @website,
           tier = @tier,
           display_order = @display_order
       WHERE id = @sponsorId`,
      { 
        sponsorId,
        name, 
        logo_url: logo_url || '', 
        website: website || '',
        tier: tier || 'bronze',
        display_order: display_order || 999
      }
    );
    
    res.json({
      success: true,
      message: 'Sponsor updated successfully'
    });
  } catch (error) {
    console.error('Error updating sponsor:', error);
    res.status(500).json({
      error: 'Failed to update sponsor'
    });
  }
});

// DELETE /api/sponsors/:id - Delete a sponsor
router.delete('/sponsors/:id', async (req, res) => {
  try {
    const sponsorId = parseInt(req.params.id);
    
    await query(
      `DELETE FROM sponsors WHERE id = @sponsorId`,
      { sponsorId }
    );
    
    res.json({
      success: true,
      message: 'Sponsor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    res.status(500).json({
      error: 'Failed to delete sponsor'
    });
  }
});

export default router;