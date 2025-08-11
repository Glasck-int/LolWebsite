import { PlayerTableEntityClient } from "@/components/players/PlayerTableEntityClient"

interface PlayerPageProps {
    params: Promise<{
        playerName: string
    }>
}

export default async function PlayerPage({ params }: PlayerPageProps) {
    const { playerName } = await params
    const decodedPlayerName = decodeURIComponent(playerName)
    
    return (
        <div className="">
            <PlayerTableEntityClient playerName={decodedPlayerName} />
        </div>
    )
}

export async function generateMetadata({ params }: PlayerPageProps) {
    const { playerName } = await params
    const decodedPlayerName = decodeURIComponent(playerName)
    
    return {
        title: `${decodedPlayerName} - Player Profile`,
        description: `View statistics, match history, and career information for ${decodedPlayerName}`
    }
}