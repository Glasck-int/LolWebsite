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

async function testSeasonsAPI() {
    try {
        console.log('🔍 Testing Seasons API for deokdam...\n')
        
        // 1. Resolve player to get redirects (same as seasons API does)
        console.log('=== STEP 1: Player Resolution ===')
        const playerResolution = await resolvePlayer('deokdam')
        console.log(`✅ Player resolved: "${playerResolution.overviewPage}"`)
        console.log(`📝 Redirect names: [${playerResolution.redirectNames.map(n => `"${n}"`).join(', ')}]`)
        console.log()
        
        const redirectNames = playerResolution.redirectNames
        
        // 2. Query ScoreboardPlayers for overviewPages (same as seasons API does)
        console.log('=== STEP 2: ScoreboardPlayers Query (overviewPage) ===')
        const scoreboardTournaments = await prisma.scoreboardPlayers.findMany({
            where: {
                OR: [
                    { name: { in: redirectNames } },
                    { link: { in: redirectNames } }
                ]
            },
            select: {
                overviewPage: true,
                name: true,
                link: true,
                tournament: true,
                dateTime_UTC: true
            },
            distinct: ['overviewPage']
        })
        
        console.log(`📊 ScoreboardPlayers entries: ${scoreboardTournaments.length}`)
        scoreboardTournaments.forEach((entry, i) => {
            console.log(`  ${i+1}. overviewPage:"${entry.overviewPage}" name:"${entry.name}" tournament:"${entry.tournament}" date:${entry.dateTime_UTC?.toISOString()?.slice(0,10)}`)
        })
        console.log()
        
        // 3. Query TournamentPlayer for overviewPages (same as seasons API does)
        console.log('=== STEP 3: TournamentPlayer Query (overviewPage) ===')
        const tournamentPlayerEntries = await prisma.tournamentPlayer.findMany({
            where: {
                OR: [
                    { player: { in: redirectNames } },
                    { link: { in: redirectNames } }
                ]
            },
            select: {
                overviewPage: true,
                player: true,
                link: true
            },
            distinct: ['overviewPage']
        })
        
        console.log(`📊 TournamentPlayer entries: ${tournamentPlayerEntries.length}`)
        tournamentPlayerEntries.forEach((entry, i) => {
            console.log(`  ${i+1}. overviewPage:"${entry.overviewPage}" player:"${entry.player}" link:"${entry.link}"`)
        })
        console.log()
        
        // 4. Combined overviewPages (same as seasons API does)
        console.log('=== STEP 4: Combined Tournament OverviewPages ===')
        const tournamentOverviewPages = new Set()
        scoreboardTournaments.forEach(t => {
            if (t.overviewPage) tournamentOverviewPages.add(t.overviewPage)
        })
        tournamentPlayerEntries.forEach(t => {
            if (t.overviewPage) tournamentOverviewPages.add(t.overviewPage)
        })
        
        console.log(`🎯 Unique tournament overviewPages: ${tournamentOverviewPages.size}`)
        Array.from(tournamentOverviewPages).forEach((page, i) => {
            console.log(`  ${i+1}. "${page}"`)
        })
        console.log()
        
        // 5. Query tournaments (same as seasons API does)
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
                { year: 'asc' },
                { name: 'asc' }
            ]
        })
        
        console.log(`🏆 Tournament details: ${tournaments.length}`)
        tournaments.forEach((tournament, i) => {
            console.log(`  ${i+1}. "${tournament.name}" (${tournament.year}) matches:${tournament._count.MatchSchedule} overviewPage:"${tournament.overviewPage}"`)
        })
        console.log()
        
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
        
        if (recentTournaments.length === 0) {
            console.log('❌ No 2024-2025 tournaments found for deokdam')
            console.log('This explains why the seasons API returns limited data')
        } else {
            console.log('✅ Recent tournaments found - seasons API should show this data')
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message)
        console.error(error.stack)
    } finally {
        await prisma.$disconnect()
    }
}

testSeasonsAPI()