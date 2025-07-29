'use client'
import React from 'react'

import { FlexColumn, FlexRow } from '@/components/ui/Flex'
import { Card } from '@/components/ui/card/Card'
import { CardBody } from '@/components/ui/card/CardBody'
import { CardHeader, CardHeaderBase } from '@/components/ui/card/CardHeader'
import { useTranslations } from 'next-intl'
import { SubTitle } from '@/components/ui/text/SubTitle'
import { Tooltip } from '@/components/utils/Tooltip'
import PlayersKdaTable from '../components/PlayersKdaTable'

export default function PlayersKda() {
    const t = useTranslations()
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardHeaderBase>
                        <div className="flex flex-row w-full justify-between">
                            <SubTitle>{t('playersKda.title')}</SubTitle>
                            <Tooltip content={t('playersKda.tooltip')} />
                        </div>
                    </CardHeaderBase>
                </CardHeader>
                <CardBody>
                    <FlexColumn>
                        <PlayersKdaTable />
                    </FlexColumn>
                </CardBody>
            </Card>
            <Card>
                <CardHeader>
                    <CardHeaderBase>Player Stats</CardHeaderBase>
                </CardHeader>
                <CardBody>
                    <FlexColumn className="gap-6 p-4">
                        <FlexRow className="justify-between">
                            <h2>Section Title</h2>
                            <button>Action</button>
                        </FlexRow>
                        <FlexColumn className="gap-2">
                            <div>Item 1</div>
                            <div>Item 2</div>
                        </FlexColumn>
                    </FlexColumn>
                </CardBody>
            </Card>
        </div>
    )
}
