const { PrismaClient } = require('./src/generated/prisma')
const prisma = new PrismaClient()

async function testDeokdamRecent() {
    try {
        console.log('🔍 Testing Deokdam RECENT seasons (2024-2025)...\n')
        
        // Get deokdam redirect names
        const redirects = await prisma.playerRedirect.findMany({
            where: { overviewPage: 'Deokdam' }
        })
        const redirectNames = redirects.map(r => r.name)
        console.log(`📝 Redirect names: [${redirectNames.map(n => `"${n}"`).join(', ')}]`)
        console.log()
        
        // Check 2024-2025 tournaments
        console.log('=== 2024-2025 Tournaments ===')
        const recentTournaments = await prisma.tournament.findMany({
            where: {
                OR: [
                    { year: '2024' },
                    { year: '2025' },
                    { name: { contains: '2024', mode: 'insensitive' } },
                    { name: { contains: '2025', mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                name: true,
                overviewPage: true,
                year: true,
                dateStart: true
            },
            take: 10
        })
        
        console.log(`🏆 Recent tournaments (2024-2025): ${recentTournaments.length}`)
        recentTournaments.slice(0, 5).forEach((t, i) => {
            console.log(`  ${i+1}. "${t.name}" (${t.overviewPage}) year:${t.year} start:${t.dateStart?.toISOString()?.slice(0,10)}`)
        })
        console.log()
        
        // Check ScoreboardPlayers in recent tournaments
        console.log('=== ScoreboardPlayers in Recent Tournaments ===')
        for (const redirectName of redirectNames) {
            const entries = await prisma.scoreboardPlayers.findMany({
                where: {
                    AND: [
                        {
                            OR: [
                                { name: redirectName },
                                { link: redirectName }
                            ]
                        },
                        {
                            tournament: {
                                contains: '2024',
                                mode: 'insensitive'
                            }
                        }
                    ]
                },
                select: {
                    name: true,
                    link: true,
                    tournament: true,
                    overviewPage: true
                },
                take: 5
            })
            
            if (entries.length > 0) {
                console.log(`📊 ScoreboardPlayers for "${redirectName}" in 2024:`)
                entries.forEach((e, i) => {
                    console.log(`  ${i+1}. name:"${e.name}" link:"${e.link}" tournament:"${e.tournament}" overviewPage:"${e.overviewPage}"`)
                })
            } else {
                console.log(`❌ No ScoreboardPlayers entries for "${redirectName}" in 2024`)
            }
        }
        console.log()
        
        // Check TournamentPlayer in recent tournaments
        console.log('=== TournamentPlayer in Recent Tournaments ===')
        for (const redirectName of redirectNames) {
            const entries = await prisma.tournamentPlayer.findMany({
                where: {
                    AND: [
                        {
                            OR: [
                                { player: redirectName },
                                { link: redirectName }
                            ]
                        },
                        {
                            overviewPage: {
                                contains: '2024',
                                mode: 'insensitive'
                            }
                        }
                    ]
                },
                select: {
                    player: true,
                    link: true,
                    overviewPage: true
                },
                take: 5
            })
            
            if (entries.length > 0) {
                console.log(`📊 TournamentPlayer for "${redirectName}" in 2024:`)
                entries.forEach((e, i) => {
                    console.log(`  ${i+1}. player:"${e.player}" link:"${e.link}" overviewPage:"${e.overviewPage}"`)
                })
            } else {
                console.log(`❌ No TournamentPlayer entries for "${redirectName}" in 2024`)
            }
        }
        console.log()
        
        // Check for any recent entries with similar names (broader search)
        console.log('=== Searching for Similar Names in Recent Data ===')
        const searchTerms = ['deokdam', 'feiz', 'seo dae', 'dae-gil']
        
        for (const term of searchTerms) {
            const similarEntries = await prisma.scoreboardPlayers.findMany({
                where: {
                    AND: [
                        {
                            OR: [
                                { name: { contains: term, mode: 'insensitive' } },
                                { link: { contains: term, mode: 'insensitive' } }
                            ]
                        },
                        {
                            OR: [
                                { tournament: { contains: '2024', mode: 'insensitive' } },
                                { tournament: { contains: '2025', mode: 'insensitive' } }
                            ]
                        }
                    ]
                },
                select: {
                    name: true,
                    link: true,
                    tournament: true
                },
                take: 5
            })
            
            if (similarEntries.length > 0) {
                console.log(`🔍 "${term}" in 2024-2025 ScoreboardPlayers: ${similarEntries.length}`)
                similarEntries.forEach((e, i) => {
                    console.log(`  ${i+1}. name:"${e.name}" link:"${e.link}" tournament:"${e.tournament}"`)
                })
                console.log()
            }
        }
        
        // Also check what player names exist in recent tournaments
        console.log('=== Sample Recent Players (2024) ===')
        const recentPlayers = await prisma.scoreboardPlayers.findMany({
            where: {
                tournament: {
                    contains: '2024',
                    mode: 'insensitive'
                }
            },
            select: {
                name: true,
                link: true,
                tournament: true
            },
            take: 20,
            distinct: ['name', 'link']
        })
        
        console.log(`📊 Sample players in 2024: ${recentPlayers.length}`)
        recentPlayers.slice(0, 10).forEach((e, i) => {
            console.log(`  ${i+1}. name:"${e.name}" link:"${e.link}"`)
        })
        
    } catch (error) {
        console.error('❌ Error:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

testDeokdamRecent()