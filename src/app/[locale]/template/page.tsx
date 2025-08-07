'use client'

import Footer from '@/components/layout/Footer/Footer'
import { useQueryString, useQueryBoolean } from '@/lib/hooks/createQueryState'

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
import ChoseDate, { useChoseDate } from '@/components/ui/calendar/ChoseDate'
import { PlayoffBracket } from '@/components/leagues/Standings/playOff/PlayoffBracket'

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

const tournamentData = [
    {
        pageName: 'Stage 3',
        nTabInPage: 4,
        tabs: [
            {
                tabName: 'Round 1',
                matchs: [
                    {
                        matchId: 1,
                        teamA: 'Fnatic',
                        teamB: 'Karmine Corp',
                        shortA: 'FNC',
                        shortB: 'KC',
                        team1Score: 0,
                        team2Score: 2,
                        dateTime_UTC: '2025-08-01T15:00:00Z',
                    },
                    {
                        matchId: 2,
                        teamA: 'G2 Esports',
                        teamB: 'Team Heretics',
                        shortA: 'G2',
                        shortB: 'TH',
                        team1Score: 2,
                        team2Score: 1,
                        dateTime_UTC: '2025-08-01T17:00:00Z',
                    },
                    {
                        matchId: 3,
                        teamA: 'Vitality',
                        teamB: 'SK Gaming',
                        shortA: 'VIT',
                        shortB: 'SK',
                        team1Score: 2,
                        team2Score: 0,
                        dateTime_UTC: '2025-08-01T19:00:00Z',
                    },
                    {
                        matchId: 4,
                        teamA: 'MAD Lions',
                        teamB: 'Astralis',
                        shortA: 'MAD',
                        shortB: 'AST',
                        team1Score: 0,
                        team2Score: 2,
                        dateTime_UTC: '2025-08-01T21:00:00Z',
                    },
                    {
                        matchId: 6,
                        teamA: 'SK Gaming',
                        teamB: 'MAD Lions',
                        shortA: 'SK',
                        shortB: 'MAD',
                        team1Score: 2,
                        team2Score: 1,
                        dateTime_UTC: '2025-08-02T17:00:00Z',
                    },
                    {
                        matchId: 5,
                        teamA: 'Fnatic',
                        teamB: 'Team Heretics',
                        shortA: 'FNC',
                        shortB: 'TH',
                        team1Score: 1,
                        team2Score: 2,
                        dateTime_UTC: '2025-08-02T15:00:00Z',
                    },
                ],
            },
            {
                tabName: 'Semi-Finals',
                matchs: [
                    {
                        matchId: 7,
                        teamA: 'Karmine Corp',
                        teamB: 'G2 Esports',
                        shortA: 'KC',
                        shortB: 'G2',
                        team1Score: 1,
                        team2Score: 2,
                        dateTime_UTC: '2025-08-03T17:00:00Z',
                    },
                    {
                        matchId: 8,
                        teamA: 'Vitality',
                        teamB: 'Astralis',
                        shortA: 'VIT',
                        shortB: 'AST',
                        team1Score: 2,
                        team2Score: 0,
                        dateTime_UTC: '2025-08-03T19:00:00Z',
                    },
                    {
                        matchId: 9,
                        teamA: 'Karmine Corp',
                        teamB: 'SK Gaming',
                        shortA: 'KC',
                        shortB: 'SK',
                        team1Score: 2,
                        team2Score: 0,
                        dateTime_UTC: '2025-08-04T15:00:00Z',
                    },
                    {
                        matchId: 10,
                        teamA: 'Astralis',
                        teamB: 'Team Heretics',
                        shortA: 'AST',
                        shortB: 'TH',
                        team1Score: 2,
                        team2Score: 1,
                        dateTime_UTC: '2025-08-04T17:00:00Z',
                    },
                ],
            },
            {
                tabName: 'Lower Final',
                matchs: [
                    {
                        matchId: 11,
                        teamA: 'Karmine Corp',
                        teamB: 'Astralis',
                        shortA: 'KC',
                        shortB: 'AST',
                        team1Score: 1,
                        team2Score: 2,
                        dateTime_UTC: '2025-08-05T15:00:00Z',
                    },
                ],
            },
            {
                tabName: 'Grand Final',
                matchs: [
                    {
                        matchId: 12,
                        teamA: 'G2 Esports',
                        teamB: 'Vitality',
                        shortA: 'G2',
                        shortB: 'VIT',
                        team1Score: 2,
                        team2Score: 1,
                        dateTime_UTC: '2025-08-06T18:00:00Z',
                    },
                    {
                        matchId: 13,
                        teamA: 'Vitality',
                        teamB: 'Astralis',
                        shortA: 'G2',
                        shortB: 'VIT',
                        team1Score: 2,
                        team2Score: 1,
                        dateTime_UTC: '2025-08-07T18:00:00Z',
                    },
                ],
            },
            {
                tabName: 'Final',
                matchs: [
                    {
                        matchId: 13,
                        teamA: 'G2 Esports',
                        teamB: 'Vitality',
                        shortA: 'G2',
                        shortB: 'VIT',
                        team1Score: 2,
                        team2Score: 1,
                        dateTime_UTC: '2025-08-06T18:00:00Z',
                    },
                ],
            },
        ],
    },
    {
        pageName: 'Stage 1',
        nTabInPage: 3,
        tabs: [
            {
                tabName: 'Quarter-Finals',
                matchs: [
                    {
                        matchId: 1,
                        teamA: 'Fnatic',
                        teamB: 'Karmine Corp',
                        shortA: 'FNC',
                        shortB: 'KC',
                        team1Score: 0,
                        team2Score: 2,
                        dateTime_UTC: '2025-08-01T15:00:00Z',
                    },
                    {
                        matchId: 2,
                        teamA: 'G2 Esports',
                        teamB: 'Team Heretics',
                        shortA: 'G2',
                        shortB: 'TH',
                        team1Score: 2,
                        team2Score: 1,
                        dateTime_UTC: '2025-08-01T17:00:00Z',
                    },
                    {
                        matchId: 3,
                        teamA: 'Vitality',
                        teamB: 'SK Gaming',
                        shortA: 'VIT',
                        shortB: 'SK',
                        team1Score: 2,
                        team2Score: 0,
                        dateTime_UTC: '2025-08-01T19:00:00Z',
                    },
                    {
                        matchId: 4,
                        teamA: 'MAD Lions',
                        teamB: 'Astralis',
                        shortA: 'MAD',
                        shortB: 'AST',
                        team1Score: 0,
                        team2Score: 2,
                        dateTime_UTC: '2025-08-01T21:00:00Z',
                    },
                ],
            },
            {
                tabName: 'Semi-Finals',
                matchs: [
                    {
                        matchId: 5,
                        teamA: 'Karmine Corp',
                        teamB: 'G2 Esports',
                        shortA: 'KC',
                        shortB: 'G2',
                        team1Score: 1,
                        team2Score: 2,
                        dateTime_UTC: '2025-08-03T17:00:00Z',
                    },
                    {
                        matchId: 6,
                        teamA: 'Vitality',
                        teamB: 'Astralis',
                        shortA: 'VIT',
                        shortB: 'AST',
                        team1Score: 2,
                        team2Score: 0,
                        dateTime_UTC: '2025-08-03T19:00:00Z',
                    },
                ],
            },
            {
                tabName: 'Final',
                matchs: [
                    {
                        matchId: 7,
                        teamA: 'G2 Esports',
                        teamB: 'Vitality',
                        shortA: 'G2',
                        shortB: 'VIT',
                        team1Score: 2,
                        team2Score: 1,
                        dateTime_UTC: '2025-08-05T18:00:00Z',
                    },
                ],
            },
        ],
    },
    {
        pageName: 'Stage 2',
        nTabInPage: 4,
        tabs: [
            {
                tabName: 'Round of 16',
                matchs: [
                    {
                        matchId: 101,
                        teamA: 'Rogue',
                        teamB: 'Excel',
                        shortA: 'RGE',
                        shortB: 'XL',
                        team1Score: 2,
                        team2Score: 0,
                        dateTime_UTC: '2025-08-10T15:00:00Z',
                    },
                    {
                        matchId: 102,
                        teamA: 'BDS',
                        teamB: 'KOI',
                        shortA: 'BDS',
                        shortB: 'KOI',
                        team1Score: 1,
                        team2Score: 2,
                        dateTime_UTC: '2025-08-10T17:00:00Z',
                    },
                    {
                        matchId: 103,
                        teamA: 'G2 Esports',
                        teamB: 'SK Gaming',
                        shortA: 'G2',
                        shortB: 'SK',
                        team1Score: 2,
                        team2Score: 0,
                        dateTime_UTC: '2025-08-10T19:00:00Z',
                    },
                    {
                        matchId: 104,
                        teamA: 'Fnatic',
                        teamB: 'MAD Lions',
                        shortA: 'FNC',
                        shortB: 'MAD',
                        team1Score: 2,
                        team2Score: 1,
                        dateTime_UTC: '2025-08-10T21:00:00Z',
                    },
                    {
                        matchId: 105,
                        teamA: 'Astralis',
                        teamB: 'Team Heretics',
                        shortA: 'AST',
                        shortB: 'TH',
                        team1Score: 0,
                        team2Score: 2,
                        dateTime_UTC: '2025-08-11T15:00:00Z',
                    },
                    {
                        matchId: 106,
                        teamA: 'Karmine Corp',
                        teamB: 'Vitality',
                        shortA: 'KC',
                        shortB: 'VIT',
                        team1Score: 2,
                        team2Score: 0,
                        dateTime_UTC: '2025-08-11T17:00:00Z',
                    },
                    {
                        matchId: 107,
                        teamA: 'LDLC',
                        teamB: 'Giants',
                        shortA: 'LDLC',
                        shortB: 'GIA',
                        team1Score: 1,
                        team2Score: 2,
                        dateTime_UTC: '2025-08-11T19:00:00Z',
                    },
                    {
                        matchId: 108,
                        teamA: 'Team BDS Academy',
                        teamB: 'UOL Sexy Edition',
                        shortA: 'BDS.A',
                        shortB: 'UOL.SE',
                        team1Score: 2,
                        team2Score: 0,
                        dateTime_UTC: '2025-08-11T21:00:00Z',
                    },
                ],
            },
            {
                tabName: 'Quarter-Finals',
                matchs: [
                    {
                        matchId: 109,
                        teamA: 'Rogue',
                        teamB: 'KOI',
                        shortA: 'RGE',
                        shortB: 'KOI',
                        team1Score: 2,
                        team2Score: 1,
                        dateTime_UTC: '2025-08-12T17:00:00Z',
                    },
                    {
                        matchId: 110,
                        teamA: 'G2 Esports',
                        teamB: 'Fnatic',
                        shortA: 'G2',
                        shortB: 'FNC',
                        team1Score: 2,
                        team2Score: 0,
                        dateTime_UTC: '2025-08-12T19:00:00Z',
                    },
                    {
                        matchId: 111,
                        teamA: 'Team Heretics',
                        teamB: 'Karmine Corp',
                        shortA: 'TH',
                        shortB: 'KC',
                        team1Score: 1,
                        team2Score: 2,
                        dateTime_UTC: '2025-08-12T21:00:00Z',
                    },
                    {
                        matchId: 112,
                        teamA: 'Giants',
                        teamB: 'Team BDS Academy',
                        shortA: 'GIA',
                        shortB: 'BDS.A',
                        team1Score: 0,
                        team2Score: 2,
                        dateTime_UTC: '2025-08-13T15:00:00Z',
                    },
                ],
            },
            {
                tabName: 'Semi-Finals',
                matchs: [
                    {
                        matchId: 113,
                        teamA: 'Rogue',
                        teamB: 'G2 Esports',
                        shortA: 'RGE',
                        shortB: 'G2',
                        team1Score: 1,
                        team2Score: 2,
                        dateTime_UTC: '2025-08-14T18:00:00Z',
                    },
                    {
                        matchId: 114,
                        teamA: 'Karmine Corp',
                        teamB: 'Team BDS Academy',
                        shortA: 'KC',
                        shortB: 'BDS.A',
                        team1Score: 0,
                        team2Score: 2,
                        dateTime_UTC: '2025-08-14T20:00:00Z',
                    },
                ],
            },
            {
                tabName: 'Final',
                matchs: [
                    {
                        matchId: 115,
                        teamA: 'G2 Esports',
                        teamB: 'Team BDS Academy',
                        shortA: 'G2',
                        shortB: 'BDS.A',
                        team1Score: 0,
                        team2Score: 0,
                        dateTime_UTC: '2025-08-16T20:00:00Z',
                    },
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
            <h3>Playoff bracket</h3>
            <div className="w-full h-1 bg-white/40" />
            <PlayoffBracket
                tournaments={tournamentData}
                trackTeamName="Karmine Corp"
            />
            <br></br>
            <h3>Querie Template</h3>
            <div className="w-full h-1 bg-white/40" />
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
            <div className="w-full h-1 bg-white/40" />
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
                                    <div className="flex flex-col justify-center items-center h-full"></div>
                                    <p>
                                        - BUG : dans tableEntity quand je passe
                                        de tab all activée a non active, ca me
                                        reset ma season a la derniere
                                    </p>
                                    <p>
                                        - Click sur Glasck sur la page principal
                                        doit scroll
                                    </p>
                                    <p>
                                        - Faire le seo des balises sur mes card{' '}
                                    </p>
                                    <p>- main page mettre la balise main</p>
                                    <p>
                                        - page sur le cote, mettre balise aside{' '}
                                    </p>
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
            <div className="w-full h-1 bg-white/40" />
            <ChoseDate {...calendar} displayWeek={true} />
            <ChoseDate {...calendar} />
            <Card>
                <h3>INFO</h3>
                <p>Live: {calendar.isLive ? 'true' : 'false'}</p>
                <p>MatchChaud: {calendar.matchChaud ? 'true' : 'false'}</p>
                <p>Search: '{calendar.search}'</p>
            </Card>
            <br></br>
            <h3>DropDown Card</h3>
            <div className="w-full h-1 bg-white/40" />
            <Card>
                <CardContext>
                    <CardHeader>
                        <CardHeaderBase className="justify-between">
                            <SubTitle>Header</SubTitle>
                            <HideCard />
                        </CardHeaderBase>
                    </CardHeader>
                    <CardBody>
                        <div className="h-[100px]">
                            <p>BODY</p>
                        </div>
                    </CardBody>
                </CardContext>
            </Card>
            <br></br>
            <h3>Switch Card</h3>
            <div className="w-full h-1 bg-white/40" />
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
            <div className="w-full h-1 bg-white/40" />
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
                            <TableEntityHeader
                                seasons={seasons}
                                allExcluded={[2]}
                            />
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
            <div className="w-full h-1 bg-white/40" />
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
            <div className="w-full h-1 bg-white/40" />
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
