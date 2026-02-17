
const https = require('https');

// Configuration from user/env
const SUPABASE_URL = 'https://jvlycyqevxsgkvogruaf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bHljeXFldnhzZ2t2b2dydWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjEwNjEsImV4cCI6MjA4NjgzNzA2MX0.Ays8K5FENEIEPzJvYKw3wokish2F32G7YIcYLqYQqWE';

const options = {
    headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
};

// Check Health or Basic Table Access (categories)
const url = `${SUPABASE_URL}/rest/v1/categories?select=count`;

console.log(`Testing connection to: ${SUPABASE_URL}...`);

const req = https.get(url, options, (res) => {
    console.log('Status Code:', res.statusCode);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('Connection Successful!');
            console.log('Response:', data);
        } else {
            console.error('Connection Failed with status:', res.statusCode);
            console.error('Error:', data);
        }
    });

}).on('error', (e) => {
    console.error('Connection Error:', e.message);
});

req.end();
