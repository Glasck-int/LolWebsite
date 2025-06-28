import { FastifyInstance } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import {
    LeagueSchema,
    CreateLeagueSchema,
    LeagueListResponse,
} from '../../schemas/league'
import { ErrorResponseSchema } from '../../schemas/common'
import prisma from '../../services/prisma'

/**
 * Register leagues routes
 *
 * @param fastify - Fastify instance to register routes on
 */
export default async function leaguesRoutes(fastify: FastifyInstance) {
    // Créer une métrique custom en utilisant le client intégré
    const customMetric = new fastify.metrics.client.Counter({
        name: 'custom_business_metric',
        help: 'Custom business logic metric for Glasck API',
        labelNames: ['operation'],
    })

    fastify.get(
        '/leagues',
        {
            schema: {
                description: 'Get all leagues',
                tags: ['leagues'],
                response: {
                    200: LeagueListResponse,

                    500: ErrorResponseSchema,
                },
            },
        },
        async () => {
            const redis = fastify.redis
            const cacheKey = 'leagues:all'
            customMetric.inc({ operation: 'get_leagues' })
            // 2. L'API vérifie si les données sont en cache
            console.log('🔍 Vérification du cache pour:', cacheKey)
            const cached = await redis.get(cacheKey)

            if (cached) {
                // Cache HIT - On a trouvé les données
                console.log('✅ Cache HIT - Données trouvées en cache')
                return JSON.parse(cached)
            }

            // 3. Cache MISS - Pas de données en cache
            console.log('❌ Cache MISS - Interrogation de la base de données')

            // 4. On interroge la base de données (opération lente)
            const startTime = Date.now()
            const leagues = await prisma.league.findMany()
            const dbTime = Date.now() - startTime
            console.log(`🗄️ Base de données interrogée en ${dbTime}ms`)

            // 5. On stocke le résultat en cache pour les prochaines fois
            await redis.setex(cacheKey, 3600, JSON.stringify(leagues))
            console.log('💾 Données mises en cache pour 1 heure')

            // 6. On retourne les données au client
            return leagues
        }
    )

    fastify.get(
        '/leagues/major',
        {
            schema: {
                description: 'Get all major leagues',
                tags: ['leagues'],
                response: {
                    200: LeagueListResponse,
                    500: ErrorResponseSchema,
                },
            },
        },
        async () => {
            customMetric.inc({ operation: 'get_major_leagues' })
            const leagues = await prisma.league.findMany({
                where: { isMajor: true },
            })
            return leagues
        }
    )
}
