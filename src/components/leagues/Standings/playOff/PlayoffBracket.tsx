import { ButtonBar } from '@/components/ui/Button/ButtonBar'
import { getTeamImageByName } from '@/lib/api/image'
import React, { useState, useMemo } from 'react'
import {
    extractPageNames,
    findPageByName,
    extractTeamInfo,
    getLoserMatch,
    getWinnerMatch,
    hasTeamLost,
    getMatchCounts,
    getLinkPosition,
    isBeforeLastTab,
    hasAnyMatch,
} from './utils'
import Image from 'next/image'
import './animeBorder.css'
import { delay } from 'framer-motion'
import { match } from 'assert'

export interface Page {
    pageName: string
    nTabInPage: number
    tabs: Tab[]
}

export interface Tab {
    tabName: string
    matchs: Match[]
}

export interface Match {
    matchId: number
    teamA: string
    teamB: string
    shortA: string
    shortB: string
    team1Score: number
    team2Score: number
    dateTime_UTC: string
}

interface PlayoffProps {
    tournaments: Page[]
    trackTeamName?: string
}

interface PageProps {
    page: Page
    trackTeamName: string
}

interface MatchProps {
    match: Match
    isLast: boolean
    isTopMatch: boolean
    nTab: number
    trackTeamName: string
    linkPosition: string | null
}

interface Team {
    name: string
    short: string
    score: number
    asWin: boolean
    imageUrl: string
}

interface TabProps {
    tab: Tab
    isLast: boolean
    nTab: number
    trackTeamName: string
    isLooserBracket: boolean
    bracket: Page
    hasLoserBracket: boolean
}

interface LooserTabProps extends TabProps {
    bracket: Page
}

interface TeamLineContainerProps {
    team: Team
    position: 'top' | 'bottom'
    isTopMatch: boolean
    trackTeamName: string
}

interface TabHeaderProps {
    tabName: string
    isLast: boolean
}

export const PlayoffBracket = ({
    tournaments,
    trackTeamName = '',
}: PlayoffProps) => {
    if (tournaments.length == 0) return <p>Error: no matchs as been found</p>
    const [pageSelected, setPageSelected] = useState(tournaments[0])

    const handleButtonClick = (option: string | null) => {
        if (!option) return
        setPageSelected(findPageByName(tournaments, option))
    }

    return (
        <div className="w-full flex flex-col gap-4">
            <ButtonBar
                options={extractPageNames(tournaments)}
                disableUnselect={true}
                defaultActiveIndex={0}
                onButtonChange={handleButtonClick}
            />
            <Page page={pageSelected} trackTeamName={trackTeamName} />
        </div>
    )
}

const Page = ({ page, trackTeamName }: PageProps) => {
    const { looserBracket, winnerBracket } = useMemo(() => {
        const looserBracket: Page = {
            pageName: 'Looser Bracket',
            nTabInPage: 0,
            tabs: [],
        }

        const winnerBracket: Page = {
            pageName: 'Winner Bracket',
            nTabInPage: page.nTabInPage,
            tabs: [],
        }

        page.tabs.forEach((tab) => {
            winnerBracket.tabs.push({ tabName: tab.tabName, matchs: [] })
            looserBracket.tabs.push({ tabName: tab.tabName, matchs: [] })
        })
        const allLosers = new Set<string>()

        const processedTabs = page.tabs.map((tab, tabIndex) => {
            const visibleMatches: Match[] = []
            const isLastTab = tabIndex === page.tabs.length - 1

            tab.matchs.forEach((match) => {
                const loser = getLoserMatch(match)
                const isLooserBracketMatch = hasTeamLost(allLosers, match)

                if (isLooserBracketMatch && !isLastTab) {
                    let looserTab = looserBracket.tabs.find(
                        (t) => t.tabName === tab.tabName
                    )
                    if (!looserTab) {
                        looserTab = { tabName: tab.tabName, matchs: [] }
                        looserBracket.tabs.push(looserTab)
                    }
                    looserTab.matchs.push(match)
                    allLosers.add(loser)
                } else {
                    visibleMatches.push(match)
                    allLosers.add(loser)
                }
            })
            return {
                ...tab,
                matchs: visibleMatches,
            }
        })

        winnerBracket.tabs = processedTabs

        return { looserBracket, winnerBracket }
    }, [page.tabs])

    const hasLooserBracket = hasAnyMatch(looserBracket)

    return (
        <div className="w-full flex flex-10 flex-col">
            <div className="w-full h-full flex">
                {winnerBracket.tabs.map((tab, index) => (
                    <Tab
                        key={index}
                        tab={tab}
                        isLast={index === winnerBracket.tabs.length - 1}
                        nTab={index}
                        trackTeamName={trackTeamName}
                        bracket={winnerBracket}
                        isLooserBracket={false}
                        hasLoserBracket={hasLooserBracket}
                    />
                ))}
            </div>
            <div className="flex w-full h-full relative">
                {hasLooserBracket && (
                    <>
                        <p className="absolute -top-3 left-2 z-10 text-sm">
                            loser bracket
                        </p>
                        {looserBracket.tabs.map((tab, index) => (
                            <Tab
                                key={index}
                                tab={tab}
                                isLast={index === looserBracket.tabs.length - 1}
                                nTab={index}
                                trackTeamName={trackTeamName}
                                bracket={looserBracket}
                                isLooserBracket={true}
                                hasLoserBracket={hasLooserBracket}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}

const Tab = ({
    tab,
    isLast,
    nTab,
    trackTeamName,
    isLooserBracket,
    bracket,
    hasLoserBracket,
}: TabProps) => {
    const [nbrMatch, nbrMatchNext] = getMatchCounts(nTab, bracket)

    return (
        <div className={`h-auto ${isLast ? 'flex-7' : 'flex-10'} min-w-38`}>
            <div className="h-full flex-1 flex flex-col gap-6">
                {!isLooserBracket && (
                    <TabHeader tabName={tab.tabName} isLast={isLast} />
                )}
                <div className="flex flex-col h-full">
                    {tab.matchs.length > 0 ? (
                        tab.matchs.map((match, index) => (
                            <Match
                                key={index}
                                match={match}
                                isLast={isLast}
                                isTopMatch={index % 2 === 0}
                                nTab={nTab}
                                trackTeamName={trackTeamName}
                                linkPosition={getLinkPosition(
                                    nbrMatch,
                                    nbrMatchNext,
                                    index % 2 === 0,
                                    (isLooserBracket || hasLoserBracket) &&
                                        isBeforeLastTab(bracket, nTab),
                                    isLooserBracket
                                )}
                            />
                        ))
                    ) : (
                        <EmptyTab isLast={isLast} nTab={nTab} />
                    )}
                </div>
            </div>
        </div>
    )
}

const EmptyTab = ({ isLast, nTab }: { isLast: boolean; nTab: number }) => {
    const delay = 0.4 * nTab + 's'
    return (
        <div className="flex-1 flex">
            {!isLast && (
                <div className="flex flex-1 flex-col">
                    <div className="flex-5 flex relative">
                        <div
                            className={`flex-5 grow-border-bot`}
                            style={{ animationDelay: delay }}
                        ></div>
                    </div>
                    <div className="flex-5"></div>
                </div>
            )}
        </div>
    )
}

const TabHeader = ({ tabName, isLast }: TabHeaderProps) => {
    return (
        <div className="h-12 flex items-center justify-left">
            <div
                className={`${
                    isLast ? 'w-10/10' : 'flex-7'
                } flex items-center justify-center min-w-38`}
            >
                <p className="font-semibold">{tabName}</p>
            </div>
            {!isLast && <div className="h-full flex-3"></div>}
        </div>
    )
}

const Match = ({
    match,
    isLast,
    isTopMatch,
    nTab,
    trackTeamName,
    linkPosition,
}: MatchProps) => {
    let content: React.ReactNode = null

    switch (linkPosition) {
        case 'line':
            content = <LineLink nTab={nTab} />
            break
        case 'top':
            content = <TopLink nTab={nTab} />
            break
        case 'bot':
            content = <BotLink nTab={nTab} />
            break
        case 'lastLoserBracketMatchBot':
            content = <LoserBracketBotLink nTab={nTab} />
            break
        case 'lastLoserBracketMatchTop':
            content = <LoserBracketTopLink nTab={nTab} />
            break
    }

    return (
        <div className="flex-1">
            <div className="w-full h-full">
                <div className="flex w-full h-full">
                    <VsCard
                        match={match}
                        isLast={isLast}
                        isTopMatch={isTopMatch}
                        nTab={nTab}
                        trackTeamName={trackTeamName}
                        linkPosition={linkPosition}
                    />
                    {!isLast && content}
                </div>
            </div>
        </div>
    )
}

const TopLink = ({ nTab }: { nTab: number }) => {
    const delay = 0.3 * nTab + 's'
    const secondDelay = 0.3 * nTab + 0.3 + 's'

    return (
        <div className="h-full flex-3 flex flex-col">
            <div className="flex-5 flex relative"></div>
            <div className="flex-5 flex relative">
                <div className="flex-5 relative">
                    <div
                        className={`grow-border-bot-top-right`}
                        style={{ animationDelay: delay }}
                    ></div>
                </div>
                <div className="flex-5 relative">
                    <div
                        className={`grow-border-bot`}
                        style={{ animationDelay: secondDelay }}
                    />
                </div>
            </div>
        </div>
    )
}

const BotLink = ({ nTab }: { nTab: number }) => {
    const delay = 0.3 * nTab + 's'
    const secondDelay = 0.3 * nTab + 0.3 + 's'

    return (
        <div className="h-full flex-3 flex flex-col">
            <div className="flex-5 flex relative">
                <div className="flex-5 relative">
                    <div
                        className={`grow-border-bot-bot-right`}
                        style={{ animationDelay: delay }}
                    ></div>
                </div>
                <div className="flex-5"></div>
            </div>
            <div className="flex-5 flex relative"></div>
        </div>
    )
}

const LineLink = ({ nTab }: { nTab: number }) => {
    const delay = 0.3 * nTab + 's'

    return (
        <div className="h-full flex-3 flex flex-col relative">
            <div className={`flex-5 relative`}>
                <div
                    className="grow-border-bot"
                    style={{ animationDelay: delay }}
                ></div>
            </div>

            <div className="flex-5 relative"></div>
        </div>
    )
}

const LoserBracketTopLink = ({ nTab }: { nTab: number }) => {
    const delay = 0.3 * nTab + 's'
    const secondDelay = 0.3 * nTab + 0.3 + 's'

    return (
        <div className="h-full flex-3 flex flex-col">
            <div className="flex-5 flex relative"></div>
            <div className="flex-5 flex relative">
                <div className="flex-5 relative">
                    <div
                        className={`grow-border-bot-top-right`}
                        style={{ animationDelay: delay }}
                    ></div>
                </div>
                <div className="flex-5 relative">
                    <div
                        className={`grow-border-top`}
                        style={{ animationDelay: secondDelay }}
                    ></div>
                </div>
            </div>
        </div>
    )
}

const LoserBracketBotLink = ({ nTab }: { nTab: number }) => {
    const delay = 0.3 * nTab + 's'
    const secondDelay = 0.3 * nTab + 0.3 + 's'

    return (
        <div className="h-full flex-3 flex flex-col">
            <div className="flex-5 flex relative">
                <div className="flex-5 relative">
                    <div
                        className={`grow-border-bot-bot-right`}
                        style={{ animationDelay: delay }}
                    ></div>
                </div>
                <div className="flex-5"></div>
            </div>
            <div className="flex-5 flex relative"></div>
        </div>
    )
}

const VsCard = ({ match, isLast, isTopMatch, trackTeamName }: MatchProps) => {
    const teamA = extractTeamInfo(match, 0)
    const teamB = extractTeamInfo(match, 1)
    const url =
        'http://49.13.26.198:8080/static/teamPng/Karmine Corplogo square.webp'

    const teamAWithImage = { ...teamA, imageUrl: url || '' }
    const teamBWithImage = { ...teamB, imageUrl: url || '' }

    return (
        <div
            className={`flex flex-col default-border-radius my-6  ${
                isLast ? 'w-10/10' : 'flex-7'
            } justify-center min-w-38`}
        >
            <TeamLineContainer
                team={teamAWithImage}
                position="top"
                isTopMatch={isTopMatch}
                trackTeamName={trackTeamName}
            />
            <TeamLineContainer
                team={teamBWithImage}
                position="bottom"
                isTopMatch={isTopMatch}
                trackTeamName={trackTeamName}
            />
        </div>
    )
}

const TeamLineContainer = ({
    team,
    position,
    isTopMatch,
    trackTeamName,
}: TeamLineContainerProps) => {
    const baseClasses = 'w-full h-8 bg-white-06 backdrop-blur'
    const roundedClasses =
        position === 'top'
            ? 'default-top-border-radius'
            : 'default-bot-border-radius '

    let borderClasses = ''
    if (position === 'top') {
        if (!isTopMatch) borderClasses = 'border-b-1 border-dark-grey'
    } else if (isTopMatch) {
        borderClasses = 'border-t-1 border-dark-grey'
    }

    return (
        <div className={`${baseClasses} ${borderClasses} ${roundedClasses} `}>
            <DisplayTeamLine
                team={team}
                position={position}
                isTopMatch={isTopMatch}
                trackTeamName={trackTeamName}
            />
        </div>
    )
}

const DisplayTeamLine = ({
    team,
    position,
    trackTeamName,
}: TeamLineContainerProps) => {
    const roundedClasses =
        position === 'top'
            ? 'default-top-border-radius'
            : 'default-bot-border-radius '

    let trackTeam = ''
    if (position === 'top') {
        if (trackTeamName === team.name) {
            trackTeam = 'border-t-1 border-violet'
        }
    } else {
        if (trackTeamName === team.name) trackTeam = 'border-b-1 border-violet'
    }

    return (
        <div
            className={`flex justify-between  pr-6 items-center h-full ${trackTeam} ${roundedClasses}`}
            style={
                team.asWin
                    ? {
                          background:
                              'linear-gradient(to right, rgba(57, 255, 176, 0.05), rgba(57, 255, 176, 0))',
                      }
                    : undefined
            }
        >
            <div className="flex items-center gap-2 h-full">
                <div className="w-[6px] h-full py-2">
                    {team.asWin && (
                        <div
                            className="bg-[#39FFB0] w-[3px] h-full default-right-border-radius"
                            style={{
                                filter: 'drop-shadow(0px 1px 4px #39FFB0)',
                            }}
                        ></div>
                    )}
                </div>
                {team.imageUrl && (
                    <Image
                        src={team.imageUrl}
                        width={20}
                        height={20}
                        alt={team.name}
                    />
                )}
                <p
                    className={`text-sm font-semibold ${
                        !team.asWin && 'text-grey'
                    }`}
                >
                    {team.short}
                </p>
            </div>
            <p className="text-sm font-semibold">{team.score}</p>
        </div>
    )
}
