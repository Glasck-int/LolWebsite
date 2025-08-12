const { PrismaClient } = require('./src/generated/prisma')
const prisma = new PrismaClient()

async function checkHaichaoImages() {
    try {
        console.log('🔍 Checking player image situations...\n')
        
        const testPlayers = ['haichao', 'xiaofang', 'milkyway']
        
        for (const playerName of testPlayers) {
            console.log(`=== ${playerName.toUpperCase()} ===`)
            
            // 1. Find the player directly
            const player = await prisma.player.findFirst({
                where: { 
                    overviewPage: { 
                        equals: playerName,
                        mode: 'insensitive' 
                    }
                }
            })
        
            if (!player) {
                console.log('❌ Player not found')
                console.log()
                continue
            }
            
            console.log(`✅ Player found: "${player.name}" (overviewPage: "${player.overviewPage}")`)
            
            // 2. Check if there are PlayerRedirects for this overviewPage
            const redirects = await prisma.playerRedirect.findMany({
                where: { overviewPage: player.overviewPage }
            })
            
            console.log(`📝 PlayerRedirects for ${player.overviewPage}: ${redirects.length}`)
            redirects.forEach(r => console.log(`  - "${r.name}"`))
            
            // 3. Check if there are images linked to any of these redirect names
            if (redirects.length > 0) {
                const redirectNames = redirects.map(r => r.name)
                const images = await prisma.playerImage.findMany({
                    where: {
                        link: { in: redirectNames }
                    }
                })
                
                console.log(`🖼️  PlayerImages for ${player.overviewPage}: ${images.length}`)
                images.forEach(img => console.log(`  - ${img.fileName} (link: "${img.link}", tournament: "${img.tournament}")`))
            } else {
                console.log(`❌ No PlayerRedirects found, so no images can be linked`)
                
                // Check if there are images that might match by similar names
                const possibleImages = await prisma.playerImage.findMany({
                    where: {
                        link: {
                            contains: player.overviewPage,
                            mode: 'insensitive'
                        }
                    },
                    take: 5
                })
                
                if (possibleImages.length > 0) {
                    console.log(`🔍 Possible images with similar link names:`)
                    possibleImages.forEach(img => console.log(`  - ${img.fileName} (link: "${img.link}")`))
                }
            }
            console.log()
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

checkHaichaoImages()