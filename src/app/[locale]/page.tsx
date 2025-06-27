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
import { Tooltip } from '../components/ui/Tooltip'

export default function Home() {
    const [selectedButton, setSelectedButton] = useState<string | null>(null)

    return (
        <div className="h-[1000px] w-full pt-[80px]">
            <div className="mt-4 h-72 p-5">
                <Card>
                    <CardHeader>
                        <CardToolTip info="tooltip info bad long ca mere wtf ca va faire quoi ? ">
                            <div>
                                <p>header</p>
                            </div>
                        </CardToolTip>
                    </CardHeader>
                    <CardBody>
							<Tooltip content="j'adore rire" align='start'>
								<p>body</p>
							</Tooltip>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}
