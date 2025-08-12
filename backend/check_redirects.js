const { PrismaClient } = require('./src/generated/prisma')
const prisma = new PrismaClient()

async function checkRedirects() {
    try {
        console.log('🔍 Checking PlayerRedirect entries for Deokdam...\n')
        
        const redirects = await prisma.playerRedirect.findMany({
            where: { overviewPage: 'Deokdam' }
        })
        
        console.log('📝 PlayerRedirect entries:')
        redirects.forEach((r, i) => {
            console.log(`  ${i+1}. name: "${r.name}"`)
        })
        console.log()
        
        // Check if there are lowercase entries in ScoreboardPlayers that don't match redirects
        console.log('=== Recent ScoreboardPlayers entries (case variations) ===')
        const recentEntries = await prisma.scoreboardPlayers.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { name: { contains: 'deokdam', mode: 'insensitive' } },
                            { link: { contains: 'deokdam', mode: 'insensitive' } }
                        ]
                    },
                    {
                        dateTime_UTC: {
                            gte: new Date('2024-01-01')
                        }
                    }
                ]
            },
            select: {
                name: true,
                link: true,
                overviewPage: true,
                dateTime_UTC: true
            },
            distinct: ['name', 'link'],
            take: 10
        })
        
        console.log(`📊 Recent entries with deokdam variations: ${recentEntries.length}`)
        recentEntries.forEach((entry, i) => {
            console.log(`  ${i+1}. name:"${entry.name}" link:"${entry.link}" date:${entry.dateTime_UTC?.toISOString()?.slice(0,10)}`)
        })
        
    } catch (error) {
        console.error('❌ Error:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

checkRedirects()