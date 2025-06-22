'use client'

import { BaseCard } from './BaseCard'
import { OneLineHeaderBase } from './header/OneLineHeaderBase'
import React from 'react'

// adapter l'ui pour l'ordi
// faire en sorte de pouvoir faire une bulle d'aide
// pourvoir le refermer

interface OneHeaderCardProps {
    title?: string;
    children: React.ReactNode;
    Header?: (props:{}) => React.ReactNode;
    help? : string;
}

export const OneHeaderCard = ({
    title,
    children,
    Header,
    help
}: OneHeaderCardProps) => {
    return (
        <BaseCard
            Header={({ className }) => (
                <OneLineHeaderBase
                    title={title}
                    Body={Header ? (props) => <Header {...props} /> : undefined}
                    className={className}
                    help={help}
                />
            )}
        >
            {children}
        </BaseCard>
    )
}
