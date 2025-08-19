// Complete test flow for registration and teaming endpoints
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testCompleteFlow() {
  console.log('🚀 Testing Complete Registration & Teaming Flow\n');
  
  try {
    // Step 1: Register users
    console.log('1. Registering users...');
    const user1Response = await axios.post(`${BASE_URL}/auth/register`, {}, {
      headers: { 'Authorization': 'Bearer test-user1-token' },
      validateStatus: () => true
    });
    
    const user2Response = await axios.post(`${BASE_URL}/auth/register`, {}, {
      headers: { 'Authorization': 'Bearer test-user2-token' },
      validateStatus: () => true
    });
    
    const organizerResponse = await axios.post(`${BASE_URL}/auth/register`, {}, {
      headers: { 'Authorization': 'Bearer test-organizer-token' },
      validateStatus: () => true
    });
    
    console.log(`User 1: ${user1Response.status} - ${user1Response.data?.message || 'Error'}`);
    console.log(`User 2: ${user2Response.status} - ${user2Response.data?.message || 'Error'}`);
    console.log(`Organizer: ${organizerResponse.status} - ${organizerResponse.data?.message || 'Error'}`);
    
    if (user1Response.status !== 200 || user2Response.status !== 200 || organizerResponse.status !== 200) {
      console.log('\n❌ Registration failed. Stopping test.');
      return;
    }
    
    // Step 2: Create an event
    console.log('\n2. Creating event...');
    const eventResponse = await axios.post(`${BASE_URL}/events`, {
      title: "Registration Test Event",
      description: "Testing event for team registration flow",
      mode: "online",
      start_at: "2025-09-15T10:00:00Z",
      end_at: "2025-09-17T18:00:00Z"
    }, {
      headers: { 'Authorization': 'Bearer test-organizer-token' },
      validateStatus: () => true
    });
    
    console.log(`Event creation: ${eventResponse.status}`);
    if (eventResponse.status !== 201) {
      console.log('Event creation failed:', eventResponse.data);
      return;
    }
    
    const eventId = eventResponse.data.data.id;
    console.log(`Event ID: ${eventId}`);
    
    // Step 3: User 1 creates team
    console.log('\n3. User 1 creates team...');
    const teamResponse = await axios.post(`${BASE_URL}/teams`, {
      event_id: eventId,
      name: "Innovation Squad"
    }, {
      headers: { 'Authorization': 'Bearer test-user1-token' },
      validateStatus: () => true
    });
    
    console.log(`Team creation: ${teamResponse.status}`);
    if (teamResponse.status !== 201) {
      console.log('Team creation failed:', teamResponse.data);
      return;
    }
    
    const inviteCode = teamResponse.data.data.invite_code;
    console.log(`Invite code: ${inviteCode}`);
    
    // Step 4: User 2 joins team
    console.log('\n4. User 2 joins team...');
    const joinResponse = await axios.post(`${BASE_URL}/teams/join`, {
      invite_code: inviteCode
    }, {
      headers: { 'Authorization': 'Bearer test-user2-token' },
      validateStatus: () => true
    });
    
    console.log(`Team join: ${joinResponse.status}`);
    if (joinResponse.status === 200) {
      console.log(`✅ Successfully joined: ${joinResponse.data.message}`);
    } else {
      console.log('Join failed:', joinResponse.data);
      return;
    }
    
    // Step 5: Check teams for both users
    console.log('\n5. Checking teams for both users...');
    const user1Teams = await axios.get(`${BASE_URL}/teams/me`, {
      headers: { 'Authorization': 'Bearer test-user1-token' },
      validateStatus: () => true
    });
    
    const user2Teams = await axios.get(`${BASE_URL}/teams/me`, {
      headers: { 'Authorization': 'Bearer test-user2-token' },
      validateStatus: () => true
    });
    
    console.log(`User 1 teams: ${user1Teams.status}`);
    console.log(`User 2 teams: ${user2Teams.status}`);
    
    if (user1Teams.status === 200 && user2Teams.status === 200) {
      const team1 = user1Teams.data.data.teams[0];
      const team2 = user2Teams.data.data.teams[0];
      
      console.log(`✅ Team "${team1.name}" has ${team1.members.length} members`);
      console.log(`✅ User 1 is creator: ${team1.is_creator}`);
      console.log(`✅ User 2 is creator: ${team2.is_creator}`);
      
      if (team1.members.length === 2 && team1.is_creator && !team2.is_creator) {
        console.log('\n🎉 SUCCESS: Complete flow working correctly!');
        console.log('- Both users registered ✓');
        console.log('- Event created ✓');
        console.log('- Team formed via invite code ✓');
        console.log('- Both users can see team with proper roles ✓');
      }
    }
    
  } catch (error) {
    console.error('❌ Flow test error:', error.response?.data || error.message);
  }
}

testCompleteFlow();