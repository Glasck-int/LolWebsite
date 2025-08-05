'use client'

import Footer from '@/components/layout/Footer/Footer'

import {
    Card,
    CardSort,
    CardHeader,
    CardHeaderBase,
    CardHeaderColumn,
    CardHeaderContent,
    CardHeaderTab,
    CardBody,
    CardBodyMultiple,
    CardBodyMultipleContent,
    CardHeaderSortContent,
    CardFooter,
    CardFooterContent,
} from '@/components/ui/card/index'

import {
    Left,
    Right,
    Mid,
} from '@/components/layout/TableEntityLayout/exemple/exemple'
import { Annoyed } from 'lucide-react'
import { SubTitle } from '@/components/ui/text/SubTitle'
import { SortedList } from '@/components/ui/card/exemple/BodySort'
import {
    TableEntityLayout,
    TableEntityHeader,
    TableEntityBody,
    TableEntityContent,
} from '@/components/layout/TableEntityLayout/TableEntityLayout'
import {
    Switch,
    SwitchContent,
    SwitchBodyMultiple,
    SwitchBodyMultipleContent,
} from '@/components/utils/switch'
import { CardContext } from '@/components/ui/card/Card'
import {
    SelectorIcon,
    SelectorBody,
    SelectorContent,
} from '@/components/utils/Selector'
import { useIndexState } from '@/lib/hooks/useIndexState'
import { HideCard } from '@/components/ui/card/HideCard'

const seasons = [
    {
        season: 's8',
        data: [
            {
                split: 'winter',
                tournaments: [
                    { tournament: 'Regular', id: 11 },
                    { tournament: 'PlayOff', id: 12 },
                ],
            },
            {
                split: 'spring',
                tournaments: [
                    { tournament: 'MainEvent', id: 13 },
                    { tournament: 'PlayOff', id: 14 },
                ],
            },
        ],
    },
    {
        season: 's9',
        data: [
            {
                split: 'winter',
                tournaments: [
                    { tournament: 'Qualifiers', id: 21 },
                    { tournament: 'Knockout', id: 22 },
                ],
            },
            {
                split: 'spring',
                tournaments: [
                    { tournament: 'Championship', id: 23 },
                    { tournament: 'Finale', id: 24 },
                ],
            },
            {
                split: 'summer',
                tournaments: [
                    { tournament: 'Warmup', id: 25 },
                    { tournament: 'GrandFinal', id: 26 },
                ],
            },
        ],
    },
    {
        season: 's10',
        data: [
            {
                split: 'winter',
                tournaments: [
                    { tournament: 'OpenBracket', id: 31 },
                    { tournament: 'Elimination', id: 32 },
                ],
            },
            {
                split: 'group',
                tournaments: [
                    { tournament: 'UpperGroup', id: 33 },
                    { tournament: 'LowerGroup', id: 34 },
                ],
            },
        ],
    },
    {
        season: 's11',
        data: [
            {
                tournaments: [
                    { tournament: 'Winter Start', id: 51 },
                    { tournament: 'MidWinter', id: 52 },
                ],
            },
        ],
    },
    {
        season: 's12',
        data: [
            {
                split: 'winter',
                tournaments: [
                    { tournament: 'Winter Start', id: 51 },
                    { tournament: 'MidWinter', id: 52 },
                ],
            },
            {
                split: 'spring',
                tournaments: [
                    { tournament: 'Spring Open', id: 53 },
                    { tournament: 'Spring Showdown', id: 54 },
                ],
            },
            {
                split: 'summer',
                tournaments: [
                    { tournament: 'Beach Brawl', id: 55 },
                    { tournament: 'Heatwave Finals', id: 56 },
                ],
            },
            {
                split: 'group',
                tournaments: [
                    { tournament: 'Group Stage Alpha', id: 57 },
                    { tournament: 'Group Stage Omega', id: 58 },
                ],
            },
        ],
    },
]

export default function Home() {
    const {
        activeIndex: selectorActiveIndex,
        setActiveIndex: setSelectorActiveIndex,
    } = useIndexState()
    const {
        activeIndex: switchActiveIndex,
        setActiveIndex: setSwitchActiveIndex,
    } = useIndexState()
    return (
        <div className="">
            <div className="">
                <Card>
                    <CardContext>
                        <CardHeader>
                            <CardHeaderColumn>
                                <CardHeaderTab>
                                    <CardHeaderContent>
                                        <p className="text-inherit">stp</p>
                                    </CardHeaderContent>
                                    <CardHeaderContent>
                                        <p className="text-inherit">
                                            fonctionne
                                        </p>
                                    </CardHeaderContent>
                                    <CardHeaderContent>
                                        <p className="text-inherit">
                                            fonctionne
                                        </p>
                                    </CardHeaderContent>
                                </CardHeaderTab>
                                <CardHeaderBase>
                                    <SubTitle>header</SubTitle>
                                </CardHeaderBase>
                            </CardHeaderColumn>
                        </CardHeader>
                        <CardBody>
                            <CardBodyMultiple>
                                <CardBodyMultipleContent>
                                    <div className="flex flex-col justify-center items-center h-full">
                                        <p>TODO Pouvoir fermer les cartes</p>
                                    </div>
                                </CardBodyMultipleContent>
                                <CardBodyMultipleContent>
                                    <p>body 2</p>
                                </CardBodyMultipleContent>
                                <CardBodyMultipleContent>
                                    <p>body 3</p>
                                </CardBodyMultipleContent>
                            </CardBodyMultiple>
                        </CardBody>
                    </CardContext>
                </Card>
            </div>
            ---
            <Card>
                <CardContext>
                    <CardHeader>
                        <CardHeaderBase className='justify-between'>
                            <SubTitle>Header</SubTitle>
                            <HideCard/>
                        </CardHeaderBase>
                    </CardHeader>
                    <CardBody >
                        <div className='h-[100px]'>
                            <p>BODY</p>
                        </div>
                    </CardBody>
                </CardContext>
            </Card>
            ---
            <div>
                <Card>
                    <CardContext>
                        <CardHeader>
                            <CardHeaderBase className="px-[15px] justify-between">
                                <SubTitle>Header</SubTitle>
                                <Switch
                                    activeIndex={switchActiveIndex}
                                    setActiveIndex={setSwitchActiveIndex}
                                >
                                    <SwitchContent>
                                        <p className="text-inherit">@15</p>
                                    </SwitchContent>
                                    <SwitchContent>
                                        <p className="text-inherit">Tout</p>
                                    </SwitchContent>
                                </Switch>
                            </CardHeaderBase>
                        </CardHeader>
                        <CardBody className="px-[15px]">
                            <SwitchBodyMultiple activeIndex={switchActiveIndex}>
                                <SwitchBodyMultipleContent>
                                    <p>BODY 1</p>
                                </SwitchBodyMultipleContent>
                                <SwitchBodyMultipleContent>
                                    <p>BODY 2</p>
                                </SwitchBodyMultipleContent>
                            </SwitchBodyMultiple>
                        </CardBody>
                    </CardContext>
                </Card>
            </div>
            ---
            <div>
                <TableEntityLayout>
                    {/* header */}
                    <Card>
                        <CardContext>
                            <CardBody>
                            <div className="hidden md:flex p-[15px] h-[130px] gap-3 w-[250px]">
                                {/* <Image
                                    src=""
                                    className="rounded-full"
                                    alt="Shreckus"
                                    width={100}
                                    height={100}
                                /> */}
                                <div className="py-[15px]">
                                    <h2>Shreckus</h2>
                                    <SubTitle>BGteams</SubTitle>
                                </div>
                            </div>
                            <TableEntityHeader seasons={seasons} allExcluded={[2]} />
                        </CardBody>
                        <CardFooter>
                            <CardFooterContent>
                                <p className="text-inherit">left super long</p>
                            </CardFooterContent>
                            <CardFooterContent>
                                <p className="text-inherit">mid</p>
                            </CardFooterContent>
                            <CardFooterContent>
                                <p className="text-inherit">right</p>
                            </CardFooterContent>
                        </CardFooter>
                        </CardContext>
                    </Card>
                    {/* body */}
                    <TableEntityBody>
                        <TableEntityContent>
                            <Left />
                        </TableEntityContent>
                        <TableEntityContent>
                            <Mid />
                        </TableEntityContent>
                        <TableEntityContent>
                            <Right />
                        </TableEntityContent>
                    </TableEntityBody>
                </TableEntityLayout>
            </div>
            ---
            <div>
                <Card>
                    <CardContext>
                        <CardHeader>
                            <CardHeaderBase className="justify-between">
                                <SubTitle>Header</SubTitle>
                                <SelectorIcon
                                    activeIndex={selectorActiveIndex}
                                    setActiveIndex={setSelectorActiveIndex}
                                >
                                    <Annoyed />
                                    <Annoyed />
                                    <Annoyed />
                                </SelectorIcon>
                            </CardHeaderBase>
                        </CardHeader>
                        <CardBody>
                            <SelectorBody activeIndex={selectorActiveIndex}>
                                <SelectorContent>
                                    <p>BODY 1</p>
                                </SelectorContent>
                                <SelectorContent>
                                    <p>Body 2</p>
                                </SelectorContent>
                                <SelectorContent>
                                    <p>Body 3</p>
                                </SelectorContent>
                            </SelectorBody>
                        </CardBody>
                    </CardContext>
                </Card>
            </div>
            ---
            <div className="">
                <Card>
                    <CardSort>
                        <CardHeader>
                            <CardHeaderBase className="flex justify-between">
                                <SubTitle>Header</SubTitle>
                                <div className="flex gap-4">
                                    <div className="grid grid-cols-1 w-60">
                                        <CardHeaderSortContent
                                            sortName={'alpha'}
                                        >
                                            <p className="text-inherit">
                                                alpha
                                            </p>
                                        </CardHeaderSortContent>
                                    </div>
                                    <CardHeaderSortContent sortName={'color'}>
                                        <p className="text-inherit">color</p>
                                    </CardHeaderSortContent>
                                    <CardHeaderSortContent sortName={'numb'}>
                                        <p className="text-inherit">numb</p>
                                    </CardHeaderSortContent>
                                </div>
                            </CardHeaderBase>
                        </CardHeader>
                        <CardBody>
                            <SortedList />
                        </CardBody>
                    </CardSort>
                </Card>
            </div>
            <Footer />
        </div>
    )
}
