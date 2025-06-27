'use client'

import { ButtonBar } from '@/app/components/ui/ButtonBar'
import { useState } from 'react'
import { TestHeader } from '@/app/components/ui/card/header/TestHeader'
import { Card, CardHeader, CardBody } from '@/app/components/ui/card/Card'

export default function Home() {
    const [selectedButton, setSelectedButton] = useState<string | null>(null)

    return (
        <div className="h-[1000px] w-full pt-[80px]">
            <div className="mt-4 h-72 p-5">
                <Card>
                    <CardHeader>
                        <div>
                            {/* <TestHeader test="super test"></TestHeader> */}
							<p>header</p>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <p>body</p>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}
