// Test to clear cache and check fresh data
const http = require('http');

async function clearCacheAndTest() {
    // First clear the cache by making a request that would invalidate it
    // Since we can't directly access Redis, we'll just wait and try again
    
    console.log('Testing fresh API call...');
    
    return new Promise((resolve, reject) => {
        const req = http.get('http://127.0.0.1:3001/api/tournaments/LEC%2F2025%20Season%2FSpring%20Season/player-stats', (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    
                    if (parsedData.players && parsedData.players.length > 0) {
                        console.log('\n=== Current API Response ===');
                        console.log('Response includes link field:', 'link' in parsedData.players[0]);
                        console.log('First player keys:', Object.keys(parsedData.players[0]));
                        
                        const firstPlayer = parsedData.players[0];
                        console.log('\n=== First Player Details ===');
                        console.log('Name:', firstPlayer.name);
                        console.log('Team:', firstPlayer.team);
                        console.log('Link present:', 'link' in firstPlayer);
                        console.log('Link value:', firstPlayer.link);
                        console.log('All properties:', JSON.stringify(firstPlayer, null, 2));
                    }
                    resolve();
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    reject(error);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('HTTP request error:', error);
            reject(error);
        });
    });
}

clearCacheAndTest();