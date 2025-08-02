// Quick test to check database values directly
const https = require('https');
const http = require('http');

async function testScoreboardPlayersAPI() {
    return new Promise((resolve, reject) => {
        const req = http.get('http://127.0.0.1:3000/api/tournaments/LEC%2F2025%20Season%2FSpring%20Season/scoreboardplayers', (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    
                    console.log('API Response Status:', response.statusCode);
                    
                    if (parsedData && parsedData.length > 0) {
                        console.log('\n=== First 3 Scoreboard Players Raw Data ===');
                        parsedData.slice(0, 3).forEach((player, index) => {
                            console.log(`\nPlayer ${index + 1}:`);
                            console.log(`  Name: ${player.name}`);
                            console.log(`  Link: ${player.link}`);
                            console.log(`  Team: ${player.team}`);
                            console.log(`  Role: ${player.role}`);
                            console.log(`  Link type: ${typeof player.link}`);
                            console.log(`  Link defined: ${player.link !== undefined}`);
                            console.log(`  Link null: ${player.link === null}`);
                            console.log(`  Link empty: ${player.link === ''}`);
                            if (player.link) {
                                console.log(`  Link length: ${player.link.length}`);
                            }
                        });
                        
                        // Count how many players have links
                        const playersWithLinks = parsedData.filter(p => p.link && p.link !== '').length;
                        const totalPlayers = parsedData.length;
                        console.log(`\n=== Link Statistics ===`);
                        console.log(`Total players: ${totalPlayers}`);
                        console.log(`Players with links: ${playersWithLinks}`);
                        console.log(`Players without links: ${totalPlayers - playersWithLinks}`);
                        
                    } else {
                        console.log('No scoreboard player data found');
                        console.log('Response type:', typeof parsedData);
                        console.log('Response length:', parsedData?.length);
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

testScoreboardPlayersAPI();