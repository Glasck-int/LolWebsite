import React from 'react'

export default async function LeaguePage({
    params,
}: {
    params: { leagueName: string }
}) {
    console.log('Ligue cliquée:', params.leagueName)

    // Exemple: si vous cliquez sur "Premier League"
    // params.leagueName = "Premier League"

    return (
        <div className="pt-24">
            <h1>Page de la ligue: {params.leagueName}</h1>
        </div>
    )
}
