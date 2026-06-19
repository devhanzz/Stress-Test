const { Client } = require('undici');

const TARGET_URL = 'https://example.com';
const TOTAL_REQUESTS = 1000;
const CONCURRENT_LIMIT = 50;

async function runSingleBatch() {
    console.log(`--- Nag-uumpisa ng bagong batch ng ${TOTAL_REQUESTS} requests ---`);
    const client = new Client(TARGET_URL);
    let completed = 0;

    async function makeRequest(id) {
        // Random jitter (100ms - 300ms) para hindi halatang robot
        await new Promise(r => setTimeout(r, Math.random() * 200 + 100));
        
        try {
            await client.request({
                path: '/',
                method: 'GET',
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            });
            completed++;
        } catch (err) {
            // Silence errors during stress test
        }
    }

    // Queue mechanism para sa 1,000 requests
    const queue = [];
    for (let i = 0; i < TOTAL_REQUESTS; i++) {
        queue.push(makeRequest(i));
        if (queue.length >= CONCURRENT_LIMIT) {
            await Promise.all(queue);
            queue.length = 0;
        }
    }
    await Promise.all(queue);
    console.log('Batch tapos na. Nag-aantay ng sandali bago mag-ulit...');
    client.close();
}

// Ang "Tuloy-tuloy" Loop
async function startInfiniteTest() {
    while (true) {
        await runSingleBatch();
        // Mag-antay ng 10 segundo bago mag-umpisa ulit para hindi masyadong aggressive
        await new Promise(r => setTimeout(r, 10000));
    }
}

startInfiniteTest();