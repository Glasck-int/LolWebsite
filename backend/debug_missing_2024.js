const { PrismaClient } = require('./src/generated/prisma')
const prisma = new PrismaClient()

async function debugMissing2024() {
    try {
        console.log('🔍 Debugging why 2024-2025 entries are missing from seasons API...\n')
        
        // 1. Check all deokdam entries in ScoreboardPlayers (including 2024-2025)
        console.log('=== ALL ScoreboardPlayers entries for Deokdam (including 2024-2025) ===')
        const allEntries = await prisma.scoreboardPlayers.findMany({
            where: {
                OR: [
                    { name: 'Deokdam' },
                    { link: 'Deokdam' },
                    { name: 'Feiz (Seo Dae-gil)' },
                    { link: 'Feiz (Seo Dae-gil)' }
                ]
            },
            select: {
                name: true,
                link: true,
                overviewPage: true,
                tournament: true,
                dateTime_UTC: true
            },
            orderBy: { dateTime_UTC: 'desc' },
            take: 20
        })
        
        console.log(`📊 ALL entries: ${allEntries.length}`)
        allEntries.forEach((entry, i) => {
            console.log(`  ${i+1}. name:"${entry.name}" link:"${entry.link}" overviewPage:"${entry.overviewPage}" date:${entry.dateTime_UTC?.toISOString()?.slice(0,10)}`)
        })
        console.log()
        
        // 2. Check specifically for 2024-2025 entries
        console.log('=== 2024-2025 ScoreboardPlayers entries ===')
        const recent2024Entries = await prisma.scoreboardPlayers.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { name: 'Deokdam' },
                            { link: 'Deokdam' },
                            { name: 'Feiz (Seo Dae-gil)' },
                            { link: 'Feiz (Seo Dae-gil)' }
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
                tournament: true,
                dateTime_UTC: true
            },
            orderBy: { dateTime_UTC: 'desc' }
        })
        
        console.log(`📊 2024-2025 entries: ${recent2024Entries.length}`)
        recent2024Entries.forEach((entry, i) => {
            console.log(`  ${i+1}. name:"${entry.name}" link:"${entry.link}" overviewPage:"${entry.overviewPage}" date:${entry.dateTime_UTC?.toISOString()?.slice(0,10)}`)
        })
        console.log()
        
        // 3. Check why the seasons API query doesn't find the 2024-2025 entries
        console.log('=== Testing exact seasons API query for 2024-2025 entries ===')
        const redirectNames = ["Feiz (Seo Dae-gil)", "Deokdam"]
        
        const seasonAPIQuery = await prisma.scoreboardPlayers.findMany({
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
                dateTime_UTC: true
            },
            distinct: ['overviewPage'],
            orderBy: { dateTime_UTC: 'desc' }
        })
        
        console.log(`📊 Seasons API query results: ${seasonAPIQuery.length}`)
        seasonAPIQuery.forEach((entry, i) => {
            console.log(`  ${i+1}. overviewPage:"${entry.overviewPage}" name:"${entry.name}" date:${entry.dateTime_UTC?.toISOString()?.slice(0,10)}`)
        })
        console.log()
        
        // 4. Check if the distinct clause is causing issues
        console.log('=== Testing query WITHOUT distinct clause ===')
        const withoutDistinct = await prisma.scoreboardPlayers.findMany({
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
                dateTime_UTC: true
            },
            orderBy: { dateTime_UTC: 'desc' }
        })
        
        console.log(`📊 Without distinct: ${withoutDistinct.length}`)
        const uniquePages = new Set()
        withoutDistinct.forEach((entry, i) => {
            if (i < 10) { // Show first 10
                console.log(`  ${i+1}. overviewPage:"${entry.overviewPage}" name:"${entry.name}" date:${entry.dateTime_UTC?.toISOString()?.slice(0,10)}`)
            }
            uniquePages.add(entry.overviewPage)
        })
        console.log(`📝 Unique overviewPages found: ${uniquePages.size}`)
        console.log()
        
        // 5. Check if case sensitivity is the issue
        console.log('=== Testing case-insensitive query ===')
        const caseInsensitive = await prisma.scoreboardPlayers.findMany({
            where: {
                OR: [
                    { name: { in: ['deokdam', 'Deokdam', 'DEOKDAM'] } },
                    { link: { in: ['deokdam', 'Deokdam', 'DEOKDAM'] } }
                ]
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
        
        console.log(`📊 Case variations query: ${caseInsensitive.length}`)
        caseInsensitive.forEach((entry, i) => {
            console.log(`  ${i+1}. overviewPage:"${entry.overviewPage}" name:"${entry.name}" date:${entry.dateTime_UTC?.toISOString()?.slice(0,10)}`)
        })
        
    } catch (error) {
        console.error('❌ Error:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

debugMissing2024()