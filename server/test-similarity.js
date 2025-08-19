// Test script for similarity detection service
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Mock Firebase token for testing (from test-socket.js)
const mockToken = 'mock-firebase-token-organizer';

// Test submissions data for similarity detection
const testSubmissions = [
  {
    title: "AI-Powered Task Manager",
    description: "An intelligent task management system using machine learning to prioritize tasks based on user behavior patterns and deadlines. Features include smart notifications, collaborative workspaces, and productivity analytics.",
    repoUrl: "https://github.com/test/ai-task-manager"
  },
  {
    title: "Smart Task Management System", 
    description: "An intelligent task management application that uses machine learning algorithms to prioritize tasks according to user behavior and deadlines. Includes smart notifications, team collaboration, and productivity metrics.",
    repoUrl: "https://github.com/test/smart-task-mgr"
  },
  {
    title: "Blockchain Voting Platform",
    description: "A secure and transparent voting system built on blockchain technology ensuring vote immutability and voter privacy through zero-knowledge proofs.",
    repoUrl: "https://github.com/test/blockchain-vote"
  },
  {
    title: "Decentralized Voting System",
    description: "A transparent and secure voting platform using blockchain technology for immutable vote records and zero-knowledge proofs for voter privacy.",
    repoUrl: "https://github.com/test/decentral-vote"
  },
  {
    title: "Weather Prediction App",
    description: "A mobile application that provides accurate weather forecasts using multiple data sources and machine learning models for local predictions.",
    repoUrl: "https://github.com/test/weather-app"
  }
];

async function createTestEvent() {
  try {
    console.log('📋 Creating test event...');
    
    // First create an event
    const eventResponse = await axios.post(`${API_BASE}/events`, {
      title: "Similarity Test Hackathon",
      description: "Test event for similarity detection",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxTeamSize: 4,
      minTeamSize: 1,
      registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      organizerId: "organizer-123"
    }, {
      headers: {
        'Authorization': `Bearer ${mockToken}`
      }
    });
    
    return eventResponse.data.event.id;
  } catch (error) {
    console.error('Failed to create event:', error.response?.data || error.message);
    throw error;
  }
}

async function createTestTeams(eventId) {
  try {
    console.log('👥 Creating test teams...');
    
    const teams = [];
    for (let i = 0; i < 5; i++) {
      const teamResponse = await axios.post(`${API_BASE}/teams`, {
        name: `Team ${i + 1}`,
        eventId: eventId,
        memberEmails: [`member${i}@test.com`]
      }, {
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      });
      teams.push(teamResponse.data.team);
    }
    
    return teams;
  } catch (error) {
    console.error('Failed to create teams:', error.response?.data || error.message);
    throw error;
  }
}

async function createTestSubmissions(eventId, teams) {
  try {
    console.log('📝 Creating test submissions...');
    
    const submissions = [];
    for (let i = 0; i < 5; i++) {
      const submissionResponse = await axios.post(`${API_BASE}/submissions`, {
        teamId: teams[i].id,
        eventId: eventId,
        title: testSubmissions[i].title,
        description: testSubmissions[i].description,
        repoUrl: testSubmissions[i].repoUrl,
        trackId: "general-track"
      }, {
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      });
      submissions.push(submissionResponse.data.submission);
    }
    
    return submissions;
  } catch (error) {
    console.error('Failed to create submissions:', error.response?.data || error.message);
    throw error;
  }
}

async function runSimilarityAnalysis(eventId) {
  try {
    console.log('\n🔍 Running similarity analysis...');
    
    const response = await axios.get(`${API_BASE}/similarity/${eventId}?analyze=true`, {
      headers: {
        'Authorization': `Bearer ${mockToken}`
      }
    });
    
    console.log('\n✅ Analysis Results:');
    console.log(`  - Submissions analyzed: ${response.data.analyzed}`);
    console.log(`  - Flagged pairs: ${response.data.flagged}`);
    
    if (response.data.results && response.data.results.length > 0) {
      console.log('\n🚨 Flagged Submission Pairs:');
      response.data.results.forEach((result, index) => {
        console.log(`\n  ${index + 1}. Similarity Score: ${result.percentageMatch}%`);
        console.log(`     📄 "${result.submission1.title}" by ${result.submission1.teamName}`);
        console.log(`     📄 "${result.submission2.title}" by ${result.submission2.teamName}`);
        
        if (result.submission1.snippet) {
          console.log(`     Preview 1: ${result.submission1.snippet.substring(0, 100)}...`);
        }
        if (result.submission2.snippet) {
          console.log(`     Preview 2: ${result.submission2.snippet.substring(0, 100)}...`);
        }
      });
    } else {
      console.log('\n✅ No suspicious similarities detected (all pairs < 80% threshold)');
    }
    
    return response.data;
  } catch (error) {
    console.error('Failed to run similarity analysis:', error.response?.data || error.message);
    throw error;
  }
}

async function getSimilarityResults(eventId) {
  try {
    console.log('\n📊 Fetching stored similarity results...');
    
    const response = await axios.get(`${API_BASE}/similarity/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${mockToken}`
      }
    });
    
    console.log(`  - Found ${response.data.results.length} stored similarity pairs`);
    return response.data;
  } catch (error) {
    console.error('Failed to get similarity results:', error.response?.data || error.message);
    throw error;
  }
}

async function markAsReviewed(eventId, submission1Id, submission2Id) {
  try {
    console.log('\n✍️ Marking pair as reviewed...');
    
    const response = await axios.post(`${API_BASE}/similarity/${eventId}/review`, {
      submission1Id,
      submission2Id,
      notes: "Reviewed and confirmed as legitimate similarity - both teams used same open-source template"
    }, {
      headers: {
        'Authorization': `Bearer ${mockToken}`
      }
    });
    
    console.log('  ✅ Pair marked as reviewed');
    return response.data;
  } catch (error) {
    console.error('Failed to mark as reviewed:', error.response?.data || error.message);
    throw error;
  }
}

async function runTest() {
  console.log('🚀 Starting Similarity Detection Test Suite\n');
  console.log('=' .repeat(50));
  
  try {
    // Create test data
    const eventId = await createTestEvent();
    console.log(`  ✅ Created event: ${eventId}`);
    
    const teams = await createTestTeams(eventId);
    console.log(`  ✅ Created ${teams.length} teams`);
    
    const submissions = await createTestSubmissions(eventId, teams);
    console.log(`  ✅ Created ${submissions.length} submissions`);
    
    // Run similarity analysis
    const analysisResults = await runSimilarityAnalysis(eventId);
    
    // Get stored results
    await getSimilarityResults(eventId);
    
    // Mark first pair as reviewed if any flagged
    if (analysisResults.results && analysisResults.results.length > 0) {
      const firstPair = analysisResults.results[0];
      await markAsReviewed(
        eventId,
        firstPair.submission1.id,
        firstPair.submission2.id
      );
      
      // Get results again to confirm review
      const updatedResults = await getSimilarityResults(eventId);
      const reviewedCount = updatedResults.results.filter(r => r.reviewed).length;
      console.log(`  - Reviewed pairs: ${reviewedCount}`);
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ Similarity Detection Test Suite Complete!');
    console.log('\n📌 Next Steps:');
    console.log('  1. Visit /dashboard as an organizer');
    console.log('  2. Navigate to the "Trust but Verify" panel');
    console.log('  3. Review flagged submission pairs');
    console.log('  4. Mark pairs as reviewed with notes');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
runTest().catch(console.error);