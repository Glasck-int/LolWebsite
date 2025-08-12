const { PrismaClient } = require('./src/generated/prisma')
const prisma = new PrismaClient()

async function investigate() {
    try {
        console.log('🔍 Investigating player data...\n')
        
        // 1. Check total count of players and redirects
        const playerCount = await prisma.player.count()
        const redirectCount = await prisma.playerRedirect.count()
        const imageCount = await prisma.playerImage.count()
        
        console.log(`📊 Database Statistics:`)
        console.log(`  - Total Players: ${playerCount}`)
        console.log(`  - Total PlayerRedirects: ${redirectCount}`)
        console.log(`  - Total PlayerImages: ${imageCount}\n`)
        
        // 2. Look for Faker-related entries
        const fakerRedirects = await prisma.playerRedirect.findMany({
            where: {
                name: {
                    contains: 'Faker',
                    mode: 'insensitive'
                }
            },
            take: 10
        })
        
        console.log(`🎭 Faker-related PlayerRedirects (${fakerRedirects.length} found):`)
        if (fakerRedirects.length > 0) {
            fakerRedirects.forEach((redirect, i) => {
                console.log(`  ${i + 1}. "${redirect.name}" → "${redirect.overviewPage}"`)
            })
        } else {
            console.log('  ❌ No Faker-related redirects found')
        }
        console.log()
        
        // 3. Check some sample player redirects
        const sampleRedirects = await prisma.playerRedirect.findMany({
            take: 10,
            orderBy: { id: 'asc' }
        })
        
        console.log(`📋 Sample PlayerRedirect entries:`)
        sampleRedirects.forEach((redirect, i) => {
            console.log(`  ${i + 1}. "${redirect.name}" → "${redirect.overviewPage}"`)
        })
        console.log()
        
        // 4. Look for T1 or SKT related entries (Faker's teams)
        const t1Redirects = await prisma.playerRedirect.findMany({
            where: {
                OR: [
                    { name: { contains: 'T1', mode: 'insensitive' } },
                    { name: { contains: 'SKT', mode: 'insensitive' } }
                ]
            },
            take: 5
        })
        
        console.log(`🏆 T1/SKT related PlayerRedirects (${t1Redirects.length} found):`)
        if (t1Redirects.length > 0) {
            t1Redirects.forEach((redirect, i) => {
                console.log(`  ${i + 1}. "${redirect.name}" → "${redirect.overviewPage}"`)
            })
        } else {
            console.log('  ❌ No T1/SKT related redirects found')
        }
        console.log()
        
        // 5. Check for any player images
        const sampleImages = await prisma.playerImage.findMany({
            take: 5,
            select: {
                fileName: true,
                link: true,
                team: true,
                tournament: true
            }
        })
        
        console.log(`🖼️  Sample PlayerImage entries:`)
        if (sampleImages.length > 0) {
            sampleImages.forEach((image, i) => {
                console.log(`  ${i + 1}. "${image.fileName}" → link:"${image.link}" team:"${image.team}" tournament:"${image.tournament}"`)
            })
        } else {
            console.log('  ❌ No player images found')
        }
        console.log()
        
        // 6. Test the exact query that's failing
        console.log(`🧪 Testing exact query: PlayerRedirect.findUnique({ where: { name: "Faker" } })`)
        const exactTest = await prisma.playerRedirect.findUnique({
            where: { name: 'Faker' }
        })
        
        if (exactTest) {
            console.log(`  ✅ Found: "${exactTest.name}" → "${exactTest.overviewPage}"`)
        } else {
            console.log(`  ❌ Not found with exact match "Faker"`)
        }
        
    } catch (error) {
        console.error('❌ Investigation failed:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

investigate()