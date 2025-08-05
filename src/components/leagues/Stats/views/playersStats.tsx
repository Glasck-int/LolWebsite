'use client'
import React from 'react'

import { FlexColumn } from '@/components/ui/Flex'
import { Card } from '@/components/ui/card/Card'
import { CardBody } from '@/components/ui/card/CardBody'
import { CardHeader, CardHeaderBase } from '@/components/ui/card/CardHeader'
import { useTranslations } from 'next-intl'
import { SubTitle } from '@/components/ui/text/SubTitle'
import { Tooltip } from '@/components/utils/Tooltip'
import { PlayerStatisticsClient } from '../../components/PlayerStatisticsClient'
import { useTournament } from '@/contexts/TournamentContext'

export default function PlayersStats() {
    const t = useTranslations()
    const { tournament } = useTournament()
    
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardHeaderBase>
                        <div className="flex flex-row w-full justify-between">
                            <SubTitle>{t('playersStats.title')}</SubTitle>
                            <Tooltip content={t('playersStats.tooltip')} />
                        </div>
                    </CardHeaderBase>
                </CardHeader>
                <CardBody>
                    <FlexColumn>
                        {tournament?.id && (
                            <PlayerStatisticsClient 
                                tournamentId={tournament.id} 
                                initialData={null}
                            />
                        )}
                    </FlexColumn>
                </CardBody>
            </Card>
        </div>
    )
}