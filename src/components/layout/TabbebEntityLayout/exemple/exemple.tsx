'use client'

import React from 'react'
import { useLayout } from '../TabbebEntityLayout'

export const Left = () => {
    const { activeSplit, activeTournament, activeId } = useLayout()

    return (
        <div className="bg-white-04 w-full h-full p-2 text-sm text-white">
            <p className="font-semibold">[Left]</p>
            <p>Split actif : {activeSplit}</p>
            <p>Tournament actif : {activeTournament}</p>
            <p>Id actif: {activeId}</p>
        </div>
    )
}

export const Mid = () => {
    const { activeSplit, activeTournament, activeId } = useLayout()

    return (
        <div className="bg-white-04 w-full h-full p-2 text-sm text-white">
            <p className="font-semibold">[Mid]</p>
            {activeSplit === 'Spring' ? (
                <p>Spring is here 🌸</p>
            ) : (
                <p>Split courant : {activeSplit}</p>
            )}
            <p>Tournoi : {activeTournament}</p>
            <p>Id actif: {activeId}</p>
        </div>
    )
}

export const Right = () => {
    const { activeSplit, activeTournament, activeId } = useLayout()
    const isFinalPhase = ['Finals', 'Playoff', 'FinalMatch'].includes(activeTournament)

    return (
        <div className="bg-white-04 w-full h-full p-2 text-sm text-white">
            <p className="font-semibold">[Right]</p>
            {isFinalPhase ? (
                <p>🚨 Phase finale en cours : {activeTournament}</p>
            ) : (
                <p>Tournoi courant : {activeTournament}</p>
            )}
            <p>Split : {activeSplit}</p>
            <p>Id actif: {activeId}</p>
        </div>
    )
}