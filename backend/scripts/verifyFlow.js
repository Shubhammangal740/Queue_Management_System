const axios = require('axios');
const io = require('socket.io-client');

const BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const testFlow = async () => {
  try {
    console.log('--- Starting Real-Time & Stability Verification Flow ---');

    // 1. Log in as ADMIN to get/create queue
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    const adminToken = adminLogin.data.data.token;
    
    const queuesResponse = await axios.get(`${BASE_URL}/queue`);
    const queueId = queuesResponse.data.data[0]._id;
    console.log(`✓ Using queue: ${queueId}`);

    // 2. Setup Socket.IO Client for User
    console.log('\n2. User: Connecting to Socket.IO...');
    const socket = io(SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('✓ User connected to Socket.IO');
      socket.emit('join_queue', queueId);
    });

    // Setup listeners
    let eventsReceived = [];
    socket.on('TOKEN_CREATED', (data) => {
      console.log('🔔 Real-time receive: TOKEN_CREATED', data);
      eventsReceived.push('TOKEN_CREATED');
    });
    socket.on('TOKEN_CALLED', (data) => {
      console.log('🔔 Real-time receive: TOKEN_CALLED', data);
      eventsReceived.push('TOKEN_CALLED');
    });
    socket.on('TOKEN_UPDATED', (data) => {
      console.log('🔔 Real-time receive: TOKEN_UPDATED', data);
      eventsReceived.push('TOKEN_UPDATED');
    });

    // 3. User: Log in and generate token
    console.log('\n3. User: Logging in and generating token...');
    const userLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john@example.com',
      password: 'password123'
    });
    const userToken = userLogin.data.data.token;
    const userId = userLogin.data.data.user.id;

    const tokenResponse = await axios.post(
      `${BASE_URL}/queue/${queueId}/token`,
      {},
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    const tokenId = tokenResponse.data.data._id;
    console.log(`✓ Token generated (Number: ${tokenResponse.data.data.tokenNumber})`);
    console.log(`✓ Message: ${tokenResponse.data.message}`);

    // Wait a bit for socket event
    await new Promise(r => setTimeout(r, 1000));

    // 4. User: Cancel their own token
    console.log('\n4. User: Canceling token...');
    const cancelResponse = await axios.patch(
      `${BASE_URL}/tokens/${tokenId}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    console.log('✓ Token marked as CANCELLED.');
    console.log(`✓ Message: ${cancelResponse.data.message}`);

    // 5. Staff: Call next user (FIFO test)
    // We need another fresh token to test staff flow
    console.log('\n5. Generating another token for Staff flow...');
    const token2Response = await axios.post(
      `${BASE_URL}/queue/${queueId}/token`,
      {},
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    const token2Id = token2Response.data.data._id;

    console.log('\n6. Staff: Logging in and calling next user...');
    const staffLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'staff1@example.com',
      password: 'password123'
    });
    const staffToken = staffLogin.data.data.token;

    const callNextResponse = await axios.post(
      `${BASE_URL}/staff/queue/call-next`,
      {},
      { headers: { Authorization: `Bearer ${staffToken}` } }
    );
    console.log(`✓ Staff called next user. Token #${callNextResponse.data.data.tokenNumber}`);
    
    // 6. Test Invalid Transition (WAITING -> COMPLETED)
    console.log('\n7. Testing Invalid Transition Safeguard (WAITING -> COMPLETED)...');
    try {
      // Create a fresh waiting token
      const token3Response = await axios.post(`${BASE_URL}/queue/${queueId}/token`, {}, { headers: { Authorization: `Bearer ${userToken}` } });
      const token3Id = token3Response.data.data._id;
      
      await axios.patch(
        `${BASE_URL}/staff/token/${token3Id}/status`,
        { status: 'COMPLETED' },
        { headers: { Authorization: `Bearer ${staffToken}` } }
      );
      console.log('✗ FAILED: Should have rejected WAITING -> COMPLETED transition');
    } catch (error) {
      console.log(`✓ Success: Rejected invalid transition. Message: ${error.response.data.message}`);
    }

    // 7. Staff: Mark COMPLETED (Correct Flow)
    console.log('\n8. Staff: Marking as COMPLETED...');
    await axios.patch(
      `${BASE_URL}/staff/token/${token2Id}/status`,
      { status: 'COMPLETED' },
      { headers: { Authorization: `Bearer ${staffToken}` } }
    );
    console.log('✓ Token marked as COMPLETED.');

    // 8. Summary of Real-time events
    console.log('\n--- Final Verification Summary ---');
    console.log('Events received over Socket.IO:', eventsReceived);
    
    if (eventsReceived.includes('TOKEN_CREATED') && eventsReceived.includes('TOKEN_CALLED') && eventsReceived.includes('TOKEN_UPDATED')) {
      console.log('✓ ALL REAL-TIME EVENTS VERIFIED');
    } else {
      console.log('✗ SOME REAL-TIME EVENTS MISSING');
    }

    console.log('\n--- Verification Flow Completed! ---');
    socket.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Test failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
    process.exit(1);
  }
};

testFlow();
