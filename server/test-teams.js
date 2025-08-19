// Test script for Team Management API endpoints
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Mock Firebase tokens for testing (in production these would be real JWTs)
const MOCK_TOKENS = {
  user1: 'test-user1-token',
  user2: 'test-user2-token',
  organizer: 'test-organizer-token'
};

const testTeamManagement = async () => {
  console.log('🧪 Testing Team Management API...\n');
  
  try {
    // Test 1: User registration (both users)
    console.log('1. Testing user registration for both users...');
    
    const user1Registration = await axios.post(`${BASE_URL}/auth/register`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOCK_TOKENS.user1}`
      },
      validateStatus: () => true
    });
    
    const user2Registration = await axios.post(`${BASE_URL}/auth/register`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOCK_TOKENS.user2}`
      },
      validateStatus: () => true
    });
    
    console.log(`User 1 Registration Status: ${user1Registration.status}`);
    console.log(`User 2 Registration Status: ${user2Registration.status}`);
    
    if (user1Registration.status === 200 && user2Registration.status === 200) {
      console.log('✅ Both users registered successfully');
    }
    
    // Test 2: Create an event first (needed for team creation)
    console.log('\n2. Creating test event...');
    const eventData = {
      title: "Team Test Hackathon",
      description: "Event for testing team functionality",
      mode: "online",
      start_at: "2025-09-01T10:00:00Z",
      end_at: "2025-09-03T18:00:00Z"
    };
    
    const eventResponse = await axios.post(`${BASE_URL}/events`, eventData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOCK_TOKENS.organizer}`
      },
      validateStatus: () => true
    });
    
    console.log(`Event creation status: ${eventResponse.status}`);
    let eventId = null;
    
    if (eventResponse.status === 201) {
      eventId = eventResponse.data.data.id;
      console.log(`✅ Event created with ID: ${eventId}`);
    }
    
    // Test 3: Create team (User 1)
    if (eventId) {
      console.log('\n3. Testing team creation by User 1...');
      const teamData = {
        event_id: eventId,
        name: "Awesome Team"
      };
      
      const teamResponse = await axios.post(`${BASE_URL}/teams`, teamData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_TOKENS.user1}`
        },
        validateStatus: () => true
      });
      
      console.log(`Status: ${teamResponse.status}`);
      console.log(`Response:`, JSON.stringify(teamResponse.data, null, 2));
      
      let inviteCode = null;
      if (teamResponse.status === 201) {
        inviteCode = teamResponse.data.data.invite_code;
        console.log(`✅ Team created with invite code: ${inviteCode}`);
        
        // Test 4: Join team (User 2)
        console.log('\n4. Testing team join by User 2...');
        const joinData = {
          invite_code: inviteCode
        };
        
        const joinResponse = await axios.post(`${BASE_URL}/teams/join`, joinData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MOCK_TOKENS.user2}`
          },
          validateStatus: () => true
        });
        
        console.log(`Status: ${joinResponse.status}`);
        console.log(`Response:`, JSON.stringify(joinResponse.data, null, 2));
        
        if (joinResponse.status === 200) {
          console.log('✅ User 2 successfully joined the team');
          
          // Test 5: Get user teams (both users)
          console.log('\n5. Testing team retrieval for both users...');
          
          const user1TeamsResponse = await axios.get(`${BASE_URL}/teams/me`, {
            headers: {
              'Authorization': `Bearer ${MOCK_TOKENS.user1}`
            },
            validateStatus: () => true
          });
          
          const user2TeamsResponse = await axios.get(`${BASE_URL}/teams/me`, {
            headers: {
              'Authorization': `Bearer ${MOCK_TOKENS.user2}`
            },
            validateStatus: () => true
          });
          
          console.log(`User 1 Teams Status: ${user1TeamsResponse.status}`);
          if (user1TeamsResponse.status === 200) {
            console.log('User 1 Teams:', JSON.stringify(user1TeamsResponse.data, null, 2));
          }
          
          console.log(`User 2 Teams Status: ${user2TeamsResponse.status}`);
          if (user2TeamsResponse.status === 200) {
            console.log('User 2 Teams:', JSON.stringify(user2TeamsResponse.data, null, 2));
          }
          
          if (user1TeamsResponse.status === 200 && user2TeamsResponse.status === 200) {
            console.log('✅ Both users can retrieve their team information');
            
            // Verify team has both members
            const user1Teams = user1TeamsResponse.data.data.teams;
            const user2Teams = user2TeamsResponse.data.data.teams;
            
            if (user1Teams.length > 0 && user2Teams.length > 0) {
              const team1 = user1Teams[0];
              const team2 = user2Teams[0];
              
              if (team1.members.length === 2 && team2.members.length === 2) {
                console.log('✅ Team correctly shows both members');
              }
            }
          }
        }
      }
    }
    
    // Test 6: Validation errors
    console.log('\n6. Testing validation errors...');
    
    const invalidTeamData = {
      event_id: "invalid-uuid",
      name: ""
    };
    
    const invalidTeamResponse = await axios.post(`${BASE_URL}/teams`, invalidTeamData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOCK_TOKENS.user1}`
      },
      validateStatus: () => true
    });
    
    console.log(`Invalid team creation status: ${invalidTeamResponse.status}`);
    if (invalidTeamResponse.status === 400) {
      console.log('✅ Validation errors properly returned');
    }
    
    // Test 7: Invalid invite code
    console.log('\n7. Testing invalid invite code...');
    
    const invalidJoinData = {
      invite_code: "INVALID"
    };
    
    const invalidJoinResponse = await axios.post(`${BASE_URL}/teams/join`, invalidJoinData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOCK_TOKENS.user2}`
      },
      validateStatus: () => true
    });
    
    console.log(`Invalid join status: ${invalidJoinResponse.status}`);
    if (invalidJoinResponse.status === 400) {
      console.log('✅ Invalid invite code properly rejected');
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to server. Make sure the server is running on port 5000');
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
    }
  }
};

// Run the tests
testTeamManagement().then(() => {
  console.log('\n🎉 Team Management API tests completed!');
}).catch(console.error);