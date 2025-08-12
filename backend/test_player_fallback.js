const { PrismaClient } = require('./src/generated/prisma')
const prisma = new PrismaClient()

async function testPlayerFallback() {
    try {
        const testPlayers = ['haichao', 'xiaofang', 'xqw', 'Sav1or', 'shad0w']
        
        console.log('🔍 Testing player fallback logic...\n')
        
        for (const playerName of testPlayers) {
            console.log(`Testing "${playerName}":`)
            
            // 1. Check PlayerRedirect
            const redirect = await prisma.playerRedirect.findUnique({
                where: { name: playerName }
            })
            console.log(`  PlayerRedirect: ${redirect ? '✅ Found' : '❌ Not found'}`)
            
            // 2. Check Player table directly
            const playerDirect = await prisma.player.findUnique({
                where: { overviewPage: playerName }
            })
            console.log(`  Player (direct): ${playerDirect ? '✅ Found' : '❌ Not found'}`)
            
            // 3. Check if there's a similar name in Player table
            const similarPlayers = await prisma.player.findMany({
                where: {
                    OR: [
                        { name: { contains: playerName, mode: 'insensitive' } },
                        { overviewPage: { contains: playerName, mode: 'insensitive' } }
                    ]
                },
                take: 3,
                select: { name: true, overviewPage: true }
            })
            
            if (similarPlayers.length > 0) {
                console.log(`  Similar players found:`)
                similarPlayers.forEach(p => console.log(`    - "${p.name}" (${p.overviewPage})`))
            } else {
                console.log(`  No similar players found`)
            }
            
            console.log()
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

testPlayerFallback()