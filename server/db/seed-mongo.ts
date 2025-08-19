import { connectMongoDB, disconnectMongoDB } from './mongo';
import { Announcement, ChatMessage, SimilarityIndex } from './models';

async function seedMongoDB() {
  try {
    console.log('Starting MongoDB seeding...');
    
    await connectMongoDB();
    
    // Clear existing data
    await Promise.all([
      Announcement.deleteMany({}),
      ChatMessage.deleteMany({}),
      SimilarityIndex.deleteMany({})
    ]);
    
    console.log('Cleared existing MongoDB data');

    // Sample event ID (would come from SQL database)
    const sampleEventId = '123e4567-e89b-12d3-a456-426614174000';
    const sampleTeamId = '987fcdeb-51a2-43d7-89ab-123456789abc';
    const sampleUserId1 = '456789ab-cdef-1234-5678-90abcdef1234';
    const sampleUserId2 = '789abcde-f123-4567-890a-bcdef1234567';
    const sampleSubmissionId1 = 'sub12345-6789-abcd-ef01-234567890abc';
    const sampleSubmissionId2 = 'sub67890-abcd-ef12-3456-7890abcdef12';

    // Seed Announcements
    console.log('Seeding announcements...');
    const announcements = [
      {
        eventId: sampleEventId,
        message: '🎉 Welcome to Fusion X Hackathon 2025! Check-in begins at 9:00 AM. Get ready for an amazing 48 hours of innovation!'
      },
      {
        eventId: sampleEventId,
        message: '⏰ Reminder: Team formation ends in 2 hours. If you need teammates, head to the networking area!'
      },
      {
        eventId: sampleEventId,
        message: '🍕 Lunch is now being served in the main hall. Vegetarian, vegan, and gluten-free options available.'
      },
      {
        eventId: sampleEventId,
        message: '💡 Mentor office hours are starting now! Find mentors in the designated areas for technical guidance.'
      },
      {
        eventId: sampleEventId,
        message: '🚨 Important: Submission deadline is tomorrow at 6:00 PM sharp. Make sure to submit your project on time!'
      }
    ];

    const createdAnnouncements = await Announcement.insertMany(announcements);
    console.log(`✅ Created ${createdAnnouncements.length} announcements`);

    // Seed Chat Messages
    console.log('Seeding chat messages...');
    const chatMessages = [
      {
        eventId: sampleEventId,
        userId: sampleUserId1,
        text: 'Hello everyone! Excited to be part of this hackathon 🎉'
      },
      {
        eventId: sampleEventId,
        teamId: sampleTeamId,
        userId: sampleUserId1,
        text: 'Hey team! I just pushed the initial project structure to our repo. Let me know what you think!'
      },
      {
        eventId: sampleEventId,
        teamId: sampleTeamId,
        userId: sampleUserId2,
        text: 'Great work! I\'m working on the API endpoints now. Should have the user authentication ready in an hour.'
      },
      {
        eventId: sampleEventId,
        userId: sampleUserId2,
        text: 'Does anyone know where I can find the Wi-Fi password?'
      },
      {
        eventId: sampleEventId,
        teamId: sampleTeamId,
        userId: sampleUserId1,
        text: 'The AI model is training now. ETA about 30 minutes for the first results!'
      },
      {
        eventId: sampleEventId,
        userId: sampleUserId1,
        text: 'Looking for someone with blockchain experience for our sustainability project. DM me!'
      },
      {
        eventId: sampleEventId,
        teamId: sampleTeamId,
        userId: sampleUserId2,
        text: 'Frontend is looking good! The user dashboard is almost complete.'
      },
      {
        eventId: sampleEventId,
        userId: sampleUserId2,
        text: 'When is the next mentor session? Need help with deployment!'
      }
    ];

    const createdMessages = await ChatMessage.insertMany(chatMessages);
    console.log(`✅ Created ${createdMessages.length} chat messages`);

    // Seed Similarity Index (Vector embeddings for submissions)
    console.log('Seeding similarity indexes...');
    const similarityIndexes = [
      {
        submissionId: sampleSubmissionId1,
        vector: Array.from({ length: 384 }, () => Math.random() * 2 - 1), // Random 384-dim vector
        meta: {
          title: 'AI-Powered Code Review Assistant',
          description: 'An intelligent system that reviews code and provides suggestions',
          tags: ['AI', 'Machine Learning', 'Developer Tools', 'Code Quality'],
          technology: ['Python', 'TensorFlow', 'React', 'Node.js'],
          category: 'AI & Machine Learning'
        }
      },
      {
        submissionId: sampleSubmissionId2,
        vector: Array.from({ length: 384 }, () => Math.random() * 2 - 1), // Random 384-dim vector
        meta: {
          title: 'Decentralized Carbon Credit Marketplace',
          description: 'A blockchain-based platform for trading verified carbon credits',
          tags: ['Blockchain', 'Sustainability', 'Web3', 'Carbon Credits'],
          technology: ['Solidity', 'React', 'Web3.js', 'IPFS'],
          category: 'Web3 & Blockchain'
        }
      }
    ];

    const createdIndexes = await SimilarityIndex.insertMany(similarityIndexes);
    console.log(`✅ Created ${createdIndexes.length} similarity indexes`);

    // Display summary
    console.log('\n📊 MongoDB Seeding Summary:');
    console.log(`• Announcements: ${createdAnnouncements.length}`);
    console.log(`• Chat Messages: ${createdMessages.length}`);
    console.log(`• Similarity Indexes: ${createdIndexes.length}`);

    console.log('\n📋 Sample Data Details:');
    console.log(`• Event ID: ${sampleEventId}`);
    console.log(`• Team ID: ${sampleTeamId}`);
    console.log(`• Users: ${sampleUserId1}, ${sampleUserId2}`);
    console.log(`• Submissions: ${sampleSubmissionId1}, ${sampleSubmissionId2}`);

    console.log('\n🎉 MongoDB seeded successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB seeding failed:', error);
    process.exit(1);
  } finally {
    await disconnectMongoDB();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedMongoDB();
}

export { seedMongoDB };