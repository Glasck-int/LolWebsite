'use client'

import React from 'react'
import { SortableTable, TableColumn } from '@/components/ui/table'
import { StandingsTable, CombinedStandingsTable } from '../components/StandingsTable'
import { NewStandingsWithTabsClient } from '../clients/NewStandingsWithTabsClient'

/**
 * Examples showing how to use the new table system
 */

// Example 1: Generic table with any data
interface PlayerStats {
    name: string
    kills: number
    deaths: number
    assists: number
    kda: number
}

const playerData: PlayerStats[] = [
    { name: "Faker", kills: 15, deaths: 3, assists: 8, kda: 7.7 },
    { name: "Caps", kills: 12, deaths: 4, assists: 10, kda: 5.5 },
    { name: "Showmaker", kills: 18, deaths: 2, assists: 6, kda: 12.0 }
]

const playerColumns: TableColumn<PlayerStats>[] = [
    {
        key: 'name',
        header: 'Joueur',
        cell: (player) => player.name,
        sortable: false
    },
    {
        key: 'kills',
        header: 'K',
        cell: (player) => player.kills,
        sortable: true,
        accessor: (player) => player.kills,
        headerClassName: 'text-center w-16',
        cellClassName: 'text-center text-green-600'
    },
    {
        key: 'deaths',
        header: 'D',
        cell: (player) => player.deaths,
        sortable: true,
        accessor: (player) => player.deaths,
        headerClassName: 'text-center w-16',
        cellClassName: 'text-center text-red-600'
    },
    {
        key: 'assists',
        header: 'A',
        cell: (player) => player.assists,
        sortable: true,
        accessor: (player) => player.assists,
        headerClassName: 'text-center w-16',
        cellClassName: 'text-center text-blue-600'
    },
    {
        key: 'kda',
        header: 'KDA',
        cell: (player) => player.kda.toFixed(1),
        sortable: true,
        accessor: (player) => player.kda,
        headerClassName: 'text-center w-20',
        cellClassName: 'text-center font-bold'
    }
]

export const GenericTableExample = () => (
    <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Exemple de tableau générique</h3>
        <SortableTable
            data={playerData}
            columns={playerColumns}
            caption="Statistiques des joueurs"
        />
    </div>
)

// Example 2: Simple standings table
export const SimpleStandingsExample = ({ data }: { data: any[] }) => (
    <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Tableau de classement simple</h3>
        <StandingsTable
            data={data} 
            config={{
                type: 'matches',
                includeForm: true,
                sortable: true
            }}
            maxRows={10}
        />
    </div>
)

// Example 3: Combined standings table  
export const CombinedStandingsExample = ({ data }: { data: any[] }) => (
    <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Tableau de classement combiné</h3>
        <CombinedStandingsTable
            data={data}
            highlightedTeam="Team Liquid"
            maxRows={8}
        />
    </div>
)

// Example 4: Full standings with tabs (replacement for the complex component)
export const CompleteStandingsExample = ({ data }: { data: any[] }) => (
    <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Classement complet avec onglets</h3>
        <NewStandingsWithTabsClient
            processedData={data}
            highlightedTeam="Team Liquid"
            maxRows={null}
        />
    </div>
)

/**
 * Migration guide:
 * 
 * BEFORE (ancien système):
 * - 450+ lignes de code
 * - CSS Grid complexe
 * - Duplication massive de code
 * - Pas de vraies balises de tableau
 * - Difficile à maintenir
 * 
 * AFTER (nouveau système):
 * - ~50 lignes de code pour le même résultat
 * - Vraies balises HTML <table>, <th>, <td>  
 * - Réutilisabilité maximale
 * - Meilleure accessibilité
 * - Plus facile à tester et maintenir
 * 
 * Pour migrer:
 * 1. Remplacer StandingsWithTabsClient par NewStandingsWithTabsClient
 * 2. Supprimer les anciennes dépendances CSS Grid
 * 3. Profiter du nouveau système réutilisable !
 */