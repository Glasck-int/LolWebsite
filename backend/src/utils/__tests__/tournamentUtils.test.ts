import { resolveTournament, getTournamentConditions } from '../tournamentUtils'
import prisma from '../../services/prisma'

// Mock prisma
jest.mock('../../services/prisma', () => ({
    tournament: {
        findUnique: jest.fn(),
        findFirst: jest.fn()
    }
}))

describe('Tournament Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('resolveTournament', () => {
        it('should resolve numeric ID correctly', async () => {
            const mockTournament = {
                id: 123,
                name: 'LEC_2024_Spring',
                overviewPage: 'LEC/2024_Season/Spring_Season'
            }
            
            ;(prisma.tournament.findUnique as jest.Mock).mockResolvedValue(mockTournament)

            const result = await resolveTournament('123')
            
            expect(prisma.tournament.findUnique).toHaveBeenCalledWith({
                where: { id: 123 },
                select: { id: true, name: true, overviewPage: true }
            })
            expect(result).toEqual(mockTournament)
        })

        it('should resolve tournament name correctly', async () => {
            const mockTournament = {
                id: 456,
                name: 'Worlds_2024',
                overviewPage: 'Worlds/2024_Season'
            }
            
            ;(prisma.tournament.findFirst as jest.Mock).mockResolvedValue(mockTournament)

            const result = await resolveTournament('Worlds_2024')
            
            expect(prisma.tournament.findFirst).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { name: 'Worlds_2024' },
                        { overviewPage: 'Worlds_2024' },
                        { standardName: 'Worlds_2024' }
                    ]
                },
                select: { id: true, name: true, overviewPage: true }
            })
            expect(result).toEqual(mockTournament)
        })

        it('should return null for non-existent tournament', async () => {
            ;(prisma.tournament.findUnique as jest.Mock).mockResolvedValue(null)
            ;(prisma.tournament.findFirst as jest.Mock).mockResolvedValue(null)

            const result = await resolveTournament('NonExistent')
            
            expect(result).toBeNull()
        })
    })

    describe('getTournamentConditions', () => {
        it('should return conditions for resolved tournament', async () => {
            const mockTournament = {
                id: 123,
                name: 'LEC_2024_Spring',
                overviewPage: 'LEC/2024_Season/Spring_Season'
            }
            
            ;(prisma.tournament.findUnique as jest.Mock).mockResolvedValue(mockTournament)

            const conditions = await getTournamentConditions('123')
            
            expect(conditions).toEqual([
                { tournament: 'LEC_2024_Spring' },
                { overviewPage: { contains: 'LEC/2024_Season/Spring_Season' } },
                { tournament: '123' }
            ])
        })

        it('should return fallback conditions for non-existent tournament', async () => {
            ;(prisma.tournament.findUnique as jest.Mock).mockResolvedValue(null)
            ;(prisma.tournament.findFirst as jest.Mock).mockResolvedValue(null)

            const conditions = await getTournamentConditions('NonExistent')
            
            expect(conditions).toEqual([
                { tournament: 'NonExistent' },
                { overviewPage: { contains: 'NonExistent' } }
            ])
        })
    })
})