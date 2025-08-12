const { PrismaClient } = require('./src/generated/prisma')
const prisma = new PrismaClient()

// Simple player resolution function (inline to avoid import issues)
async function resolvePlayer(playerName) {
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

async function testFixedSeasonsAPI() {
    try {
        console.log('🔍 Testing FIXED Seasons API for deokdam...\n')
        
        // 1. Resolve player to get redirects
        console.log('=== STEP 1: Player Resolution ===')
        const playerResolution = await resolvePlayer('deokdam')
        console.log(`✅ Player resolved: "${playerResolution.overviewPage}"`)
        console.log(`📝 Redirect names: [${playerResolution.redirectNames.map(n => `"${n}"`).join(', ')}]`)
        console.log()
        
        const redirectNames = playerResolution.redirectNames
        
        // 2. Test NEW case-insensitive query for ScoreboardPlayers
        console.log('=== STEP 2: NEW Case-Insensitive ScoreboardPlayers Query ===')
        const scoreboardTournaments = await prisma.scoreboardPlayers.findMany({
            where: {
                OR: redirectNames.flatMap(name => [
                    { name: { equals: name, mode: 'insensitive' } },
                    { link: { equals: name, mode: 'insensitive' } }
                ])
            },
            select: {
                overviewPage: true,
                name: true,
                link: true,
                dateTime_UTC: true
            },
            distinct: ['overviewPage'],
            orderBy: { dateTime_UTC: 'desc' }
        })
        
        console.log(`📊 ScoreboardPlayers entries (case-insensitive): ${scoreboardTournaments.length}`)
        scoreboardTournaments.slice(0, 10).forEach((entry, i) => {
            console.log(`  ${i+1}. overviewPage:"${entry.overviewPage}" name:"${entry.name}" date:${entry.dateTime_UTC?.toISOString()?.slice(0,10)}`)
        })
        console.log()
        
        // 3. Test TournamentPlayer query (also case-insensitive)
        console.log('=== STEP 3: Case-Insensitive TournamentPlayer Query ===')
        const tournamentPlayerEntries = await prisma.tournamentPlayer.findMany({
            where: {
                OR: redirectNames.flatMap(name => [
                    { player: { equals: name, mode: 'insensitive' } },
                    { link: { equals: name, mode: 'insensitive' } }
                ])
            },
            select: {
                overviewPage: true,
                player: true,
                link: true
            },
            distinct: ['overviewPage']
        })
        
        console.log(`📊 TournamentPlayer entries (case-insensitive): ${tournamentPlayerEntries.length}`)
        tournamentPlayerEntries.slice(0, 10).forEach((entry, i) => {
            console.log(`  ${i+1}. overviewPage:"${entry.overviewPage}" player:"${entry.player}"`)
        })
        console.log()
        
        // 4. Combined overviewPages
        console.log('=== STEP 4: Combined Tournament OverviewPages ===')
        const tournamentOverviewPages = new Set()
        scoreboardTournaments.forEach(t => {
            if (t.overviewPage) tournamentOverviewPages.add(t.overviewPage)
        })
        tournamentPlayerEntries.forEach(t => {
            if (t.overviewPage) tournamentOverviewPages.add(t.overviewPage)
        })
        
        console.log(`🎯 Total unique tournament overviewPages: ${tournamentOverviewPages.size}`)
        console.log()
        
        // 5. Query tournaments and check for 2024-2025
        console.log('=== STEP 5: Tournament Details Query ===')
        const tournaments = await prisma.tournament.findMany({
            where: {
                overviewPage: { in: Array.from(tournamentOverviewPages) }
            },
            select: {
                id: true,
                name: true,
                year: true,
                split: true,
                overviewPage: true,
                _count: {
                    select: {
                        MatchSchedule: true
                    }
                }
            },
            orderBy: [
                { year: 'desc' },
                { name: 'asc' }
            ]
        })
        
        console.log(`🏆 Tournament details: ${tournaments.length}`)
        
        // 6. Check for recent tournaments (2024-2025)
        console.log('=== STEP 6: Recent Tournaments (2024-2025) ===')
        const recentTournaments = tournaments.filter(t => 
            t.year === '2024' || t.year === '2025' || 
            (t.name && (t.name.includes('2024') || t.name.includes('2025')))
        )
        
        console.log(`🎯 Recent tournaments found: ${recentTournaments.length}`)
        recentTournaments.forEach((tournament, i) => {
            console.log(`  ${i+1}. "${tournament.name}" (${tournament.year}) matches:${tournament._count.MatchSchedule}`)
        })
        
        if (recentTournaments.length > 0) {
            console.log('\n✅ SUCCESS! Recent tournaments found - seasons API should now show 2024-2025 data for deokdam')
        } else {
            console.log('\n❌ Still no 2024-2025 tournaments found')
        }
        
        // 7. Show all tournaments chronologically
        console.log('\n=== All Tournaments (Chronological) ===')
        tournaments.forEach((tournament, i) => {
            console.log(`  ${i+1}. "${tournament.name}" (${tournament.year}) matches:${tournament._count.MatchSchedule}`)
        })
        
    } catch (error) {
        console.error('❌ Error:', error.message)
        console.error(error.stack)
    } finally {
        await prisma.$disconnect()
    }
}

testFixedSeasonsAPI()