// Test script for Event API endpoints
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Mock Firebase token for testing (in production this would be a real JWT)
const MOCK_TOKEN = 'test-organizer-token';

const testEventCreation = async () => {
  console.log('🧪 Testing Event Creation API...\n');
  
  try {
    // Test 1: Valid event creation
    console.log('1. Testing valid event creation...');
    const validEvent = {
      title: "AI Innovation Hackathon",
      description: "48-hour hackathon focused on AI and machine learning solutions for real-world problems. Teams will compete across multiple tracks with mentorship from industry experts.",
      mode: "online",
      start_at: "2025-09-15T09:00:00Z",
      end_at: "2025-09-17T18:00:00Z"
    };
    
    const response1 = await axios.post(`${BASE_URL}/events`, validEvent, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOCK_TOKEN}`
      },
      validateStatus: () => true // Don't throw on non-2xx status codes
    });
    
    console.log(`Status: ${response1.status}`);
    console.log(`Response:`, JSON.stringify(response1.data, null, 2));
    
    if (response1.status === 201) {
      console.log('✅ Event creation successful');
      const eventId = response1.data.data.id;
      
      // Test 2: Add track to event
      console.log('\n2. Testing track creation...');
      const trackData = {
        name: "Machine Learning",
        description: "Build ML solutions for healthcare, finance, or education",
        max_teams: 20
      };
      
      const response2 = await axios.post(`${BASE_URL}/events/${eventId}/tracks`, trackData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_TOKEN}`
        },
        validateStatus: () => true
      });
      
      console.log(`Status: ${response2.status}`);
      console.log(`Response:`, JSON.stringify(response2.data, null, 2));
      
      // Test 3: Get event with details
      console.log('\n3. Testing event retrieval...');
      const response3 = await axios.get(`${BASE_URL}/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${MOCK_TOKEN}`
        },
        validateStatus: () => true
      });
      
      console.log(`Status: ${response3.status}`);
      console.log(`Response:`, JSON.stringify(response3.data, null, 2));
      
    } else {
      console.log('❌ Event creation failed');
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to server. Make sure the server is running on port 5000');
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
    }
  }
  
  // Test 4: Validation errors
  console.log('\n4. Testing validation errors...');
  try {
    const invalidEvent = {
      title: "", // Invalid: empty title
      description: "Test",
      mode: "invalid", // Invalid: not online/offline
      start_at: "invalid-date", // Invalid: not ISO datetime
      end_at: "2025-09-01T10:00:00Z"
    };
    
    const response4 = await axios.post(`${BASE_URL}/events`, invalidEvent, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOCK_TOKEN}`
      },
      validateStatus: () => true
    });
    
    console.log(`Status: ${response4.status}`);
    console.log(`Response:`, JSON.stringify(response4.data, null, 2));
    
    if (response4.status === 400) {
      console.log('✅ Validation errors properly returned');
    }
    
  } catch (error) {
    console.error('❌ Validation test error:', error.response?.data || error.message);
  }
  
  // Test 5: Unauthorized access
  console.log('\n5. Testing unauthorized access...');
  try {
    const response5 = await axios.post(`${BASE_URL}/events`, validEvent, {
      headers: {
        'Content-Type': 'application/json'
        // No Authorization header
      },
      validateStatus: () => true
    });
    
    console.log(`Status: ${response5.status}`);
    console.log(`Response:`, JSON.stringify(response5.data, null, 2));
    
    if (response5.status === 401) {
      console.log('✅ Unauthorized access properly blocked');
    }
    
  } catch (error) {
    console.error('❌ Auth test error:', error.response?.data || error.message);
  }
};

// Run the tests
testEventCreation().then(() => {
  console.log('\n🎉 Event API tests completed!');
}).catch(console.error);