const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://loldb:nSfHLmDEXAeLKkUF6Pcu@49.13.26.198:5432/glasck_static"
    }
  }
})

async function investigatePlayers() {
  try {
    console.log('🔍 Investigating PlayerRedirect table...\n')

    // Check total count
    const totalRedirects = await prisma.playerRedirect.count()
    console.log(`📊 Total PlayerRedirect entries: ${totalRedirects}`)

    // Search for Faker variations
    const fakerVariations = ['Faker', 'faker', 'FAKER', 'T1 Faker', 'SKT Faker']
    console.log('\n🔍 Searching for Faker variations:')
    
    for (const variation of fakerVariations) {
      const result = await prisma.playerRedirect.findMany({
        where: {
          name: {
            contains: variation,
            mode: 'insensitive'
          }
        },
        select: { name: true, overviewPage: true }
      })
      console.log(`  "${variation}": ${result.length} matches`)
      if (result.length > 0) {
        result.forEach(r => console.log(`    - ${r.name} (${r.overviewPage})`))
      }
    }

    // Get sample of names starting with F
    console.log('\n📋 Players starting with "F":')
    const playersWithF = await prisma.playerRedirect.findMany({
      where: {
        name: {
          startsWith: 'F'
        }
      },
      select: { name: true, overviewPage: true },
      take: 20
    })
    playersWithF.forEach(p => console.log(`  - ${p.name} (${p.overviewPage})`))

    // Get random sample
    console.log('\n🎲 Random sample of 10 player names:')
    const randomSample = await prisma.playerRedirect.findMany({
      select: { name: true, overviewPage: true },
      take: 10
    })
    randomSample.forEach(p => console.log(`  - ${p.name} (${p.overviewPage})`))

    // Check if there are any Korean players (common pattern for Faker)
    console.log('\n🇰🇷 Searching for potential Korean player patterns:')
    const koreanPatterns = ['T1', 'SK', 'Gen', 'KT', 'DRX', 'DK']
    
    for (const pattern of koreanPatterns) {
      const result = await prisma.playerRedirect.findMany({
        where: {
          name: {
            contains: pattern,
            mode: 'insensitive'
          }
        },
        select: { name: true, overviewPage: true },
        take: 5
      })
      if (result.length > 0) {
        console.log(`  Players with "${pattern}":`)
        result.forEach(r => console.log(`    - ${r.name} (${r.overviewPage})`))
      }
    }

  } catch (error) {
    console.error('❌ Error investigating players:', error)
  } finally {
    await prisma.$disconnect()
  }
}

investigatePlayers()