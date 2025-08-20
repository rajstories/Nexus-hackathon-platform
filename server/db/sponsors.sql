-- Sponsors table for storing event sponsors and partners
CREATE TABLE IF NOT EXISTS sponsors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    website VARCHAR(500),
    tier VARCHAR(50) DEFAULT 'bronze', -- platinum, gold, silver, bronze
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_event_sponsors (event_id),
    INDEX idx_sponsor_order (event_id, display_order)
);

-- Sample data for testing
INSERT INTO sponsors (event_id, name, logo_url, website, tier, display_order) VALUES
(1, 'Microsoft', 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg', 'https://microsoft.com', 'platinum', 1),
(1, 'Google', 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', 'https://google.com', 'platinum', 2),
(1, 'Amazon Web Services', 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg', 'https://aws.amazon.com', 'gold', 3),
(1, 'GitHub', 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg', 'https://github.com', 'gold', 4),
(1, 'Vercel', 'https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png', 'https://vercel.com', 'silver', 5),
(1, 'Stripe', 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg', 'https://stripe.com', 'silver', 6);