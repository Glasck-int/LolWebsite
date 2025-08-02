// Quick test to check the API response structure
const https = require('https');
const http = require('http');

async function testPlayerStatsAPI() {
    return new Promise((resolve, reject) => {
        const req = http.get('http://127.0.0.1:3000/api/tournaments/LEC%2F2025%20Season%2FSpring%20Season/player-stats', (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    
                    console.log('API Response Status:', response.statusCode);
                    console.log('API Response Headers:', response.headers);
                    
                    if (parsedData.players && parsedData.players.length > 0) {
                        console.log('\n=== First Player Data ===');
                        console.log(JSON.stringify(parsedData.players[0], null, 2));
                        
                        console.log('\n=== Link Field Analysis ===');
                        parsedData.players.slice(0, 5).forEach((player, index) => {
                            console.log(`Player ${index + 1}:`);
                            console.log(`  Name: ${player.name}`);
                            console.log(`  Link: ${player.link}`);
                            console.log(`  Link type: ${typeof player.link}`);
                            console.log(`  Link defined: ${player.link !== undefined}`);
                            console.log(`  Link null: ${player.link === null}`);
                            console.log(`  Link empty: ${player.link === ''}`);
                            console.log('---');
                        });
                    } else {
                        console.log('No player data found');
                        console.log('Full response:', JSON.stringify(parsedData, null, 2));
                    }
                    resolve();
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    console.log('Raw response:', data);
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

testPlayerStatsAPI();