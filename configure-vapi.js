const https = require('https');

const options = {
  hostname: 'b5c3de2db80c.ngrok-free.app',
  port: 443,
  path: '/api/vapi/assistant',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
};

const data = JSON.stringify({ action: 'update' });

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      console.log('\nResponse:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('\nResponse:', body);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();

console.log('Configuring Vapi assistant...');
