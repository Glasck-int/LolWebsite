'use client'

import Footer from '@/components/layout/Footer/Footer'
import {
    useQueryString,
    useQueryBoolean,
} from '@/lib/hooks/createQueryState'

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
} from '@/components/utils/Switch'
import { CardContext } from '@/components/ui/card/Card'
import {
    SelectorIcon,
    SelectorBody,
    SelectorContent,
} from '@/components/utils/Selector'
import { useIndexState } from '@/lib/hooks/useIndexState'
import { HideCard } from '@/components/ui/card/HideCard'
import ChoseDate, {useChoseDate} from '@/components/ui/calendar/ChoseDate'

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
    const [search, setSearch] = useQueryString('search', '')
    const [isLive, setIsLive] = useQueryBoolean('live', false)
    const calendar = useChoseDate()

    const {
        activeIndex: selectorActiveIndex,
        setActiveIndex: setSelectorActiveIndex,
    } = useIndexState()
    const {
        activeIndex: switchActiveIndex,
        setActiveIndex: setSwitchActiveIndex,
    } = useIndexState()
    return (
        <div className="body-container">
            <h3>Querie Template</h3>
            <div className='w-full h-1 bg-white/40'/>
            <div className="flex flex-row gap-3">
                <p>Input search:</p>
                <input
                    className="bg-white-06 default-border-radius text-white px-4 w-100"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="change search"
                />
            </div>
            <p>Search = {search ? `'${search}'` : "''"}</p>
            <button
                onClick={() => setIsLive(!isLive)}
                className="w-30 bg-white-06 default-border-radius cursor-pointer hover:bg-white/20"
            >
                <p>Toggle Live</p>
            </button>
            <p>{isLive ? 'true' : 'false'}</p>
            <br></br>
            <h3>Tab Card</h3>
            <div className='w-full h-1 bg-white/40'/>
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
                                    </div>
                                        <p>- BUG : dans tableEntity quand je passe de tab all activée a non active, ca me reset ma season a la derniere</p>
                                        <p>- Click sur Glasck sur la page principal doit scroll</p>
                                        <p>- Calendar affichage par semaine</p>
                                        <p>- Faire le seo des balises sur mes card </p>
                                        <p>- main page mettre la balise main</p>
                                        <p>- page sur le cote, mettre balise aside </p>
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
            <br></br>
            <h3>Calendar</h3>
            <div className='w-full h-1 bg-white/40'/>
            <ChoseDate {...calendar} weekDisplay={true} />
            <Card>
                <h3>INFO</h3>
                <p>Live: {calendar.isLive ? "true" : "false"}</p>
                <p>MatchChaud: {calendar.matchChaud ? "true" : "false"}</p>
                <p>Search: '{calendar.search}'</p>
            </Card>
            <br></br>
            <h3>DropDown Card</h3>
            <div className='w-full h-1 bg-white/40'/>
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
            <br></br>
            <h3>Switch Card</h3>
            <div className='w-full h-1 bg-white/40'/>
            <div>
                <Card>
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
                </Card>
            </div>
            <br></br>
            <h3>Table Entity Layout</h3>
            <div className='w-full h-1 bg-white/40'/>
            <div>
                <TableEntityLayout>
                    {/* header */}
                    <Card>
                        <CardBody>
                            <div className="hidden md:flex p-[15px] h-[130px] gap-3 w-[250px]">
                                <img
                                    src="https://content.imageresizer.com/images/memes/SLAY-ALL-DAY-meme-7fequ2.jpg"
                                    className="rounded-full"
                                />
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
            <br></br>
            <h3>SelectorIcon</h3>
            <div className='w-full h-1 bg-white/40'/>
            <div>
                <Card>
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
                </Card>
            </div>
            <br></br>
            <h3>Sort In Card</h3>
            <div className='w-full h-1 bg-white/40'/>
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
