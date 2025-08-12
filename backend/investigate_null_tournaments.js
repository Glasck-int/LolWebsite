const { PrismaClient } = require('./src/generated/prisma')
const prisma = new PrismaClient()

async function investigateNullTournaments() {
    try {
        console.log('🔍 Investigating NULL tournament entries for deokdam...\n')
        
        // 1. Check deokdam entries with null tournaments
        console.log('=== Deokdam Entries with NULL Tournaments ===')
        const nullTournamentEntries = await prisma.scoreboardPlayers.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { name: 'deokdam' },
                            { link: 'deokdam' }
                        ]
                    },
                    {
                        dateTime_UTC: {
                            gte: new Date('2024-01-01')
                        }
                    },
                    {
                        tournament: null
                    }
                ]
            },
            select: {
                name: true,
                link: true,
                overviewPage: true,
                tournament: true,
                dateTime_UTC: true,
                team: true,
                role: true
            },
            take: 10
        })
        
        console.log(`📊 NULL tournament entries: ${nullTournamentEntries.length}`)
        nullTournamentEntries.slice(0, 5).forEach((entry, i) => {
            console.log(`  ${i+1}. name:"${entry.name}" team:"${entry.team}" role:"${entry.role}" overviewPage:"${entry.overviewPage}" date:${entry.dateTime_UTC?.toISOString()?.slice(0,10)}`)
        })
        console.log()
        
        // 2. Check if there are valid tournament entries for deokdam in 2024
        console.log('=== Deokdam Entries with VALID Tournaments (2024+) ===')
        const validTournamentEntries = await prisma.scoreboardPlayers.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { name: 'deokdam' },
                            { link: 'deokdam' }
                        ]
                    },
                    {
                        dateTime_UTC: {
                            gte: new Date('2024-01-01')
                        }
                    },
                    {
                        tournament: {
                            not: null
                        }
                    }
                ]
            },
            select: {
                name: true,
                link: true,
                overviewPage: true,
                tournament: true,
                dateTime_UTC: true,
                team: true,
                role: true
            },
            take: 10
        })
        
        console.log(`📊 Valid tournament entries: ${validTournamentEntries.length}`)
        validTournamentEntries.forEach((entry, i) => {
            console.log(`  ${i+1}. name:"${entry.name}" team:"${entry.team}" tournament:"${entry.tournament}" date:${entry.dateTime_UTC?.toISOString()?.slice(0,10)}`)
        })
        console.log()
        
        // 3. Check the overviewPage values from NULL entries to see if they match actual tournaments
        console.log('=== Checking OverviewPage Values from NULL Entries ===')
        const overviewPages = [...new Set(nullTournamentEntries.map(e => e.overviewPage).filter(Boolean))]
        console.log(`📝 Unique overviewPages: ${overviewPages.length}`)
        
        for (const overviewPage of overviewPages.slice(0, 5)) {
            const tournament = await prisma.tournament.findFirst({
                where: { overviewPage: overviewPage },
                select: { id: true, name: true, year: true, overviewPage: true }
            })
            
            if (tournament) {
                console.log(`  ✅ "${overviewPage}" → Tournament: "${tournament.name}" (${tournament.year}) ID:${tournament.id}`)
            } else {
                console.log(`  ❌ "${overviewPage}" → No matching tournament found`)
            }
        }
        console.log()
        
        // 4. Check what's causing the tournament field to be null
        console.log('=== Sample of ALL Recent ScoreboardPlayers (to see pattern) ===')
        const recentEntries = await prisma.scoreboardPlayers.findMany({
            where: {
                dateTime_UTC: {
                    gte: new Date('2024-01-01')
                }
            },
            select: {
                name: true,
                tournament: true,
                overviewPage: true,
                dateTime_UTC: true
            },
            take: 10,
            orderBy: { dateTime_UTC: 'desc' }
        })
        
        console.log(`📊 Recent entries (sample): ${recentEntries.length}`)
        recentEntries.forEach((entry, i) => {
            const tournamentStatus = entry.tournament ? '✅' : '❌'
            console.log(`  ${i+1}. ${tournamentStatus} name:"${entry.name}" tournament:"${entry.tournament}" overviewPage:"${entry.overviewPage}" date:${entry.dateTime_UTC?.toISOString()?.slice(0,10)}`)
        })
        
    } catch (error) {
        console.error('❌ Error:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

investigateNullTournaments()