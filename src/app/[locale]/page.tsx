'use client'

import { ButtonBar } from '@/app/components/ui/ButtonBar'
import { useState } from 'react'
import { TestHeader } from '@/app/components/ui/card/header/TestHeader'
import {
    Card,
    CardHeader,
    CardBody,
    CardToolTip,
} from '@/app/components/ui/card/Card'
import { Tooltip, ToolTipBody, ToolTipMessage } from '../components/ui/Tooltip'

export default function Home() {
    const [selectedButton, setSelectedButton] = useState<string | null>(null)

    return (
        <div className="h-[1000px] w-full pt-[80px]">
            <div className="mt-4 h-72 p-5">
                <Card>
                    <CardHeader>
                        <CardToolTip info="tooltip info bad long ca mere wtf ca va faire quoi ? ">
                            <p>header</p>
                        </CardToolTip>
                    </CardHeader>
                    <CardBody>
                        <div className="text-clear-violet inline-block">
                            <Tooltip>
                                <ToolTipMessage>
                                    <p>simple message</p>
                                </ToolTipMessage>
                                <ToolTipBody>
                                    <p>simploe body</p>
                                </ToolTipBody>
                            </Tooltip>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}
