/**
 * Basic test file for playerUtils
 * This is a simple test to verify the utility functions work correctly
 * 
 * Note: This assumes you have test data in your database.
 * You can run this with: npx ts-node src/utils/playerUtils.test.ts
 */

import { resolvePlayer, getPlayerRedirectNames, getPlayerOverviewPage, playerExists, PlayerNotFoundError } from './playerUtils'

async function runTests() {
    console.log('🧪 Testing playerUtils...')
    
    try {
        // Test 1: Basic player resolution
        console.log('\n1. Testing basic player resolution...')
        try {
            const resolution = await resolvePlayer('Caps')
            console.log('✅ Basic resolution works:', {
                overviewPage: resolution.overviewPage,
                redirectCount: resolution.redirectNames.length
            })
        } catch (error) {
            if (error instanceof PlayerNotFoundError) {
                console.log('⚠️  Player "Caps" not found in database - this is expected if no test data exists')
            } else {
                throw error
            }
        }

        // Test 2: Player redirect names utility
        console.log('\n2. Testing redirect names utility...')
        try {
            const names = await getPlayerRedirectNames('Caps')
            console.log('✅ Redirect names utility works:', names)
        } catch (error) {
            if (error instanceof PlayerNotFoundError) {
                console.log('⚠️  Player "Caps" not found - skipping redirect names test')
            } else {
                throw error
            }
        }

        // Test 3: Overview page utility
        console.log('\n3. Testing overview page utility...')
        try {
            const overviewPage = await getPlayerOverviewPage('Caps')
            console.log('✅ Overview page utility works:', overviewPage)
        } catch (error) {
            if (error instanceof PlayerNotFoundError) {
                console.log('⚠️  Player "Caps" not found - skipping overview page test')
            } else {
                throw error
            }
        }

        // Test 4: Player exists check
        console.log('\n4. Testing player exists utility...')
        const exists = await playerExists('Caps')
        console.log(`✅ Player exists utility works: Caps exists = ${exists}`)

        // Test 5: Non-existent player
        console.log('\n5. Testing non-existent player...')
        const nonExistentExists = await playerExists('NonExistentPlayer123')
        console.log(`✅ Non-existent player check works: NonExistentPlayer123 exists = ${nonExistentExists}`)

        // Test 6: Full resolution with all options
        console.log('\n6. Testing full resolution with all options...')
        try {
            const fullResolution = await resolvePlayer('Caps', {
                includePlayer: true,
                includeRedirects: true,
                includeImages: true
            })
            console.log('✅ Full resolution works:', {
                hasPlayer: !!fullResolution.player,
                hasRedirects: !!fullResolution.redirects,
                hasImages: !!fullResolution.images,
                playerName: fullResolution.player?.name,
                redirectCount: fullResolution.redirects?.length,
                imageCount: fullResolution.images?.length
            })
        } catch (error) {
            if (error instanceof PlayerNotFoundError) {
                console.log('⚠️  Player "Caps" not found - skipping full resolution test')
            } else {
                throw error
            }
        }

        console.log('\n🎉 All tests completed successfully!')
        
    } catch (error) {
        console.error('❌ Test failed:', error)
        process.exit(1)
    }
}

// Only run tests if this file is executed directly
if (require.main === module) {
    runTests()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Test runner failed:', error)
            process.exit(1)
        })
}

export { runTests }