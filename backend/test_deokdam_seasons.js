const { PrismaClient } = require('./src/generated/prisma')
const prisma = new PrismaClient()

// Simple player resolution function
async function resolvePlayerSimple(playerName) {
    // Try PlayerRedirect first
    let playerRedirect = await prisma.playerRedirect.findUnique({
        where: { name: playerName }
    })
    
    if (!playerRedirect) {
        // Try Player table directly (case insensitive)
        const playerDirect = await prisma.player.findFirst({
            where: { 
                overviewPage: { 
                    equals: playerName,
                    mode: 'insensitive' 
                }
            }
        })
        
        if (!playerDirect) {
            throw new Error(`Player not found: ${playerName}`)
        }
        
        // Get all redirects for this player
        const redirects = await prisma.playerRedirect.findMany({
            where: { overviewPage: playerDirect.overviewPage }
        })
        
        return {
            overviewPage: playerDirect.overviewPage,
            redirectNames: redirects.map(r => r.name)
        }
    } else {
        // Get all redirects for this player
        const redirects = await prisma.playerRedirect.findMany({
            where: { overviewPage: playerRedirect.overviewPage }
        })
        
        return {
            overviewPage: playerRedirect.overviewPage,
            redirectNames: redirects.map(r => r.name)
        }
    }
}

async function testDeokdamSeasons() {
    try {
        console.log('🔍 Testing Deokdam seasons data...\n')
        
        // 1. Test player resolution
        console.log('=== STEP 1: Player Resolution ===')
        let playerResolution
        try {
            playerResolution = await resolvePlayerSimple('deokdam')
            console.log(`✅ Player resolved: "${playerResolution.overviewPage}"`)
            console.log(`📝 Redirect names: [${playerResolution.redirectNames.map(n => `"${n}"`).join(', ')}]`)
        } catch (error) {
            console.log('❌ Player not found:', error.message)
            return
        }
        
        const redirectNames = playerResolution.redirectNames
        console.log()
        
        // 2. Test ScoreboardPlayers
        console.log('=== STEP 2: ScoreboardPlayers ===')
        const scoreboardEntries = await prisma.scoreboardPlayers.findMany({
            where: {
                OR: [
                    { name: { in: redirectNames } },
                    { link: { in: redirectNames } }
                ]
            },
            select: {
                name: true,
                link: true,
                overviewPage: true,
                tournament: true
            },
            take: 10
        })
        
        console.log(`📊 ScoreboardPlayers entries: ${scoreboardEntries.length}`)
        scoreboardEntries.slice(0, 5).forEach((entry, i) => {
            console.log(`  ${i+1}. name:"${entry.name}" link:"${entry.link}" tournament:"${entry.tournament}"`)
        })
        
        const scoreboardTournaments = [...new Set(scoreboardEntries.map(e => e.overviewPage).filter(Boolean))]
        console.log(`🏆 Unique tournaments from ScoreboardPlayers: ${scoreboardTournaments.length}`)
        console.log()
        
        // 3. Test TournamentPlayer
        console.log('=== STEP 3: TournamentPlayer ===')
        const tournamentPlayerEntries = await prisma.tournamentPlayer.findMany({
            where: {
                OR: [
                    { player: { in: redirectNames } },
                    { link: { in: redirectNames } }
                ]
            },
            select: {
                player: true,
                link: true,
                overviewPage: true
            },
            take: 10
        })
        
        console.log(`📊 TournamentPlayer entries: ${scoreboardEntries.length}`)
        tournamentPlayerEntries.slice(0, 5).forEach((entry, i) => {
            console.log(`  ${i+1}. player:"${entry.player}" link:"${entry.link}" tournament:"${entry.overviewPage}"`)
        })
        
        const tournamentPlayerTournaments = [...new Set(tournamentPlayerEntries.map(e => e.overviewPage).filter(Boolean))]
        console.log(`🏆 Unique tournaments from TournamentPlayer: ${tournamentPlayerTournaments.length}`)
        console.log()
        
        // 4. Combined results
        console.log('=== STEP 4: Combined Results ===')
        const allTournamentPages = [...new Set([...scoreboardTournaments, ...tournamentPlayerTournaments])]
        console.log(`🎯 Total unique tournaments: ${allTournamentPages.length}`)
        
        if (allTournamentPages.length === 0) {
            console.log('❌ No tournaments found for this player')
            
            // Debug: check if there are any entries with similar names
            console.log('\n🔍 Checking for similar player names...')
            const similarPlayers = await prisma.scoreboardPlayers.findMany({
                where: {
                    OR: [
                        { name: { contains: 'deokdam', mode: 'insensitive' } },
                        { link: { contains: 'deokdam', mode: 'insensitive' } }
                    ]
                },
                select: { name: true, link: true },
                take: 10,
                distinct: ['name', 'link']
            })
            
            console.log(`Similar entries in ScoreboardPlayers: ${similarPlayers.length}`)
            similarPlayers.forEach((p, i) => {
                console.log(`  ${i+1}. name:"${p.name}" link:"${p.link}"`)
            })
        } else {
            console.log(`✅ Found tournaments for deokdam`)
            allTournamentPages.slice(0, 10).forEach((t, i) => {
                console.log(`  ${i+1}. ${t}`)
            })
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

testDeokdamSeasons()