const { PrismaClient } = require('./src/generated/prisma')
const prisma = new PrismaClient()

async function findDeokdam2024() {
    try {
        console.log('🔍 Searching for Deokdam in 2024-2025 data with broader search...\n')
        
        // 1. Search for any variations of the name in recent ScoreboardPlayers
        console.log('=== Broad Search in ScoreboardPlayers ===')
        const variations = [
            'deokdam', 'dok', 'dam', 'seo', 'dae', 'gil', 'feiz',
            'DWG', 'KIA', 'T1', 'GEN', 'HLE', 'KT', 'LSB', 'NS', 'BRO', 'FOX'  // Team prefixes
        ]
        
        for (const term of variations) {
            // Search in any recent tournaments (not just 2024)
            const entries = await prisma.scoreboardPlayers.findMany({
                where: {
                    AND: [
                        {
                            OR: [
                                { name: { contains: term, mode: 'insensitive' } },
                                { link: { contains: term, mode: 'insensitive' } }
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
                    tournament: true,
                    dateTime_UTC: true,
                    overviewPage: true
                },
                take: 10
            })
            
            if (entries.length > 0) {
                console.log(`🔍 Found "${term}" in 2024+ data: ${entries.length}`)
                entries.slice(0, 3).forEach((e, i) => {
                    console.log(`  ${i+1}. name:"${e.name}" link:"${e.link}" tournament:"${e.tournament}" date:${e.dateTime_UTC?.toISOString()?.slice(0,10)}`)
                })
                console.log()
            }
        }
        
        // 2. Look for recent ADC players (Deokdam's role)
        console.log('=== Recent ADC Players ===')
        const adcPlayers = await prisma.scoreboardPlayers.findMany({
            where: {
                AND: [
                    { role: 'ADC' },
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
                tournament: true,
                dateTime_UTC: true
            },
            take: 20,
            distinct: ['name', 'link'],
            orderBy: {
                dateTime_UTC: 'desc'
            }
        })
        
        console.log(`🎯 Recent ADC players: ${adcPlayers.length}`)
        adcPlayers.slice(0, 10).forEach((p, i) => {
            console.log(`  ${i+1}. name:"${p.name}" link:"${p.link}" date:${p.dateTime_UTC?.toISOString()?.slice(0,10)}`)
        })
        console.log()
        
        // 3. Check TournamentPlayer for 2024 data
        console.log('=== TournamentPlayer 2024+ Data ===')
        const recentTournamentPlayers = await prisma.tournamentPlayer.findMany({
            where: {
                overviewPage: {
                    OR: [
                        { contains: '2024', mode: 'insensitive' },
                        { contains: '2025', mode: 'insensitive' }
                    ]
                }
            },
            select: {
                player: true,
                link: true,
                overviewPage: true,
                team: true
            },
            take: 20,
            distinct: ['player', 'link']
        })
        
        console.log(`📊 Recent TournamentPlayer entries: ${recentTournamentPlayers.length}`)
        recentTournamentPlayers.slice(0, 10).forEach((p, i) => {
            console.log(`  ${i+1}. player:"${p.player}" link:"${p.link}" team:"${p.team}" tournament:"${p.overviewPage}"`)
        })
        console.log()
        
        // 4. Search for potential new redirect names
        console.log('=== Searching for Potential New Names ===')
        const potentialNames = ['DK Deokdam', 'T1 Deokdam', 'Gen Deokdam', 'KT Deokdam', 'HLE Deokdam', 'Deokdam (', 'Seo Dae-gil']
        
        for (const name of potentialNames) {
            const found = await prisma.scoreboardPlayers.findMany({
                where: {
                    OR: [
                        { name: { contains: name, mode: 'insensitive' } },
                        { link: { contains: name, mode: 'insensitive' } }
                    ]
                },
                select: {
                    name: true,
                    link: true,
                    tournament: true,
                    dateTime_UTC: true
                },
                take: 5
            })
            
            if (found.length > 0) {
                console.log(`🎯 Found potential match "${name}": ${found.length}`)
                found.forEach((f, i) => {
                    console.log(`  ${i+1}. name:"${f.name}" link:"${f.link}" tournament:"${f.tournament}" date:${f.dateTime_UTC?.toISOString()?.slice(0,10)}`)
                })
                console.log()
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

findDeokdam2024()