import { query } from './db/sql.js';

const createSponsorsTable = async () => {
  try {
    // Create the sponsors table
    await query(`
      CREATE TABLE IF NOT EXISTS sponsors (
        id INT IDENTITY(1,1) PRIMARY KEY,
        event_id INT NOT NULL,
        name NVARCHAR(255) NOT NULL,
        logo_url NVARCHAR(500),
        website NVARCHAR(500),
        tier NVARCHAR(50) DEFAULT 'bronze',
        display_order INT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
      )
    `);
    
    console.log('Sponsors table created successfully');
    
    // Check if sample data exists
    const existingData = await query('SELECT COUNT(*) as count FROM sponsors');
    
    if ((existingData as any).recordset[0].count === 0) {
      // Insert sample data
      const sampleSponsors = [
        { event_id: 1, name: 'Microsoft', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg', website: 'https://microsoft.com', tier: 'platinum', display_order: 1 },
        { event_id: 1, name: 'Google', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', website: 'https://google.com', tier: 'platinum', display_order: 2 },
        { event_id: 1, name: 'Amazon Web Services', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg', website: 'https://aws.amazon.com', tier: 'gold', display_order: 3 },
        { event_id: 1, name: 'GitHub', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg', website: 'https://github.com', tier: 'gold', display_order: 4 },
        { event_id: 1, name: 'Vercel', logo_url: 'https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png', website: 'https://vercel.com', tier: 'silver', display_order: 5 },
        { event_id: 1, name: 'Stripe', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg', website: 'https://stripe.com', tier: 'silver', display_order: 6 }
      ];
      
      for (const sponsor of sampleSponsors) {
        await query(
          `INSERT INTO sponsors (event_id, name, logo_url, website, tier, display_order) 
           VALUES (@event_id, @name, @logo_url, @website, @tier, @display_order)`,
          sponsor
        );
      }
      
      console.log('Sample sponsors data inserted');
    }
    
    // Create index
    await query('CREATE INDEX idx_event_sponsors ON sponsors(event_id)');
    await query('CREATE INDEX idx_sponsor_order ON sponsors(event_id, display_order)');
    console.log('Indexes created');
    
  } catch (error) {
    console.error('Error setting up sponsors table:', error);
  }
  
  process.exit(0);
};

createSponsorsTable();