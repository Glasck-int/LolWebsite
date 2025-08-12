// Use the direct Prisma client
const { PrismaClient } = require('./src/generated/prisma')
const prisma = new PrismaClient()

async function testExactQuery() {
    try {
        console.log('🧪 Testing the exact query used by the backend route...')
        
        // This is the exact same query as in the route
        const playerCheck = await prisma.playerRedirect.findUnique({
            where: { name: 'Faker' }
        })
        
        console.log('Result:', playerCheck)
        
        if (playerCheck) {
            console.log('✅ Player found!')
            console.log(`  - name: "${playerCheck.name}"`)
            console.log(`  - overviewPage: "${playerCheck.overviewPage}"`)
        } else {
            console.log('❌ Player not found')
        }
        
    } catch (error) {
        console.error('❌ Query failed:', error.message)
        console.error('Error details:', error)
    } finally {
        await prisma.$disconnect()
    }
}

testExactQuery()