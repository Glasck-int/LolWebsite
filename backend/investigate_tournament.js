const { PrismaClient } = require('./src/generated/prisma')
const prisma = new PrismaClient()

async function investigateTournament() {
    try {
        console.log('🔍 Investigating tournament 1139...\n')
        
        // Check if tournament 1139 exists
        const tournament = await prisma.tournament.findUnique({
            where: { overviewPage: '1139' }
        })
        
        console.log(`🏆 Tournament 1139:`)
        if (tournament) {
            console.log(`  ✅ Found: "${tournament.name}"`)
            console.log(`  📅 Dates: ${tournament.dateStart} to ${tournament.dateEnd}`)
            console.log(`  🏟️  League: ${tournament.league}`)
            console.log(`  🌍 Region: ${tournament.region}`)
        } else {
            console.log(`  ❌ Tournament with overviewPage "1139" not found`)
        }
        console.log()
        
        // Check some sample tournaments
        const sampleTournaments = await prisma.tournament.findMany({
            take: 5,
            select: {
                overviewPage: true,
                name: true,
                dateStart: true,
                dateEnd: true
            },
            orderBy: { id: 'desc' }
        })
        
        console.log(`📋 Sample tournaments:`)
        sampleTournaments.forEach((t, i) => {
            console.log(`  ${i + 1}. overviewPage:"${t.overviewPage}" name:"${t.name}" dates:${t.dateStart}-${t.dateEnd}`)
        })
        
        // Check if there are any numeric tournament IDs
        const numericTournaments = await prisma.tournament.findMany({
            where: {
                overviewPage: {
                    regex: '^[0-9]+$'
                }
            },
            take: 10,
            select: {
                overviewPage: true,
                name: true
            }
        })
        
        console.log(`\n🔢 Numeric overviewPage tournaments:`)
        if (numericTournaments.length > 0) {
            numericTournaments.forEach((t, i) => {
                console.log(`  ${i + 1}. overviewPage:"${t.overviewPage}" name:"${t.name}"`)
            })
        } else {
            console.log(`  ❌ No tournaments with numeric overviewPage found`)
        }
        
    } catch (error) {
        console.error('❌ Tournament investigation failed:', error.message)
        
        // Try alternative approaches if regex fails
        console.log('\n🔄 Trying alternative approach...')
        try {
            const tournamentCount = await prisma.tournament.count()
            console.log(`📊 Total tournaments: ${tournamentCount}`)
            
            // Search for tournaments that might match 1139
            const searchResults = await prisma.tournament.findMany({
                where: {
                    OR: [
                        { overviewPage: { contains: '1139' } },
                        { name: { contains: '1139' } }
                    ]
                },
                select: {
                    overviewPage: true,
                    name: true
                }
            })
            
            console.log(`🔍 Tournaments containing "1139":`)
            if (searchResults.length > 0) {
                searchResults.forEach((t, i) => {
                    console.log(`  ${i + 1}. overviewPage:"${t.overviewPage}" name:"${t.name}"`)
                })
            } else {
                console.log(`  ❌ No tournaments containing "1139" found`)
            }
        } catch (innerError) {
            console.error('❌ Alternative approach failed:', innerError.message)
        }
    } finally {
        await prisma.$disconnect()
    }
}

investigateTournament()