import { ButtonBar } from '@/components/ui/Button/ButtonBar'
import { getTeamImageByName } from '@/lib/api/image'
import React, { useState } from 'react'
import {
    extractPageNames,
    findPageByName,
    extractTeamInfo,
    getLoserMatch,
    getWinnerMatch,
    hasTeamLost
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
    looserBracket: Page
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
    const looserBracket: Page = {pageName:"Looser Bracket", nTabInPage:0, tabs:[]}
    return (
        <div className="w-full flex flex-10">
            {page.tabs.map((tab, index) => (
                <Tab
                    key={index}
                    tab={tab}
                    isLast={index === page.tabs.length - 1}
                    nTab={index}
                    trackTeamName={trackTeamName}
                    looserBracket={looserBracket}
                />
            ))}
        </div>
    )
}

const Tab = ({ tab, isLast, nTab, trackTeamName, looserBracket }: TabProps) => {
    const allLosers = new Set<string>();

    looserBracket.tabs.forEach(t =>
        t.matchs.forEach(match => {
            const loser =
                match.team1Score > match.team2Score
                    ? match.teamB
                    : match.teamA;
            allLosers.add(loser);
        })
    );
    const visibleMatches: Match[] = [];
    
    tab.matchs.forEach((match) => {
        const loser = getLoserMatch(match)
        const alreadyInlooserBracket = hasTeamLost(allLosers, match)
        
        if (alreadyInlooserBracket){
            let looserTab = looserBracket.tabs.find(t => t.tabName === tab.tabName);
            if (!looserTab){
                looserTab = {
                    tabName:tab.tabName,
                    matchs:[]
                }
                looserBracket.tabs.push(looserTab) 
            }
            looserTab.matchs.push(match)
        }else{
            visibleMatches.push(match)
            allLosers.add(loser)
        }
    });
    console.log("all loser", allLosers)
    console.log(looserBracket, tab.tabName)

    return (
        <div className={`h-auto ${isLast ? 'flex-7' : 'flex-10'}`}>
            <div className="h-full flex-1 flex flex-col gap-6">
                <TabHeader tabName={tab.tabName} isLast={isLast} />
                <div className="flex flex-col h-full">
                    {visibleMatches.map((match, index) => (
                        <Match
                            key={index}
                            match={match}
                            isLast={isLast}
                            isTopMatch={index % 2 === 0}
                            nTab={nTab}
                            trackTeamName={trackTeamName}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

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
}: MatchProps) => {
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
                    />
                    {!isLast && (
                        <LinkMatch
                            match={match}
                            isLast={isLast}
                            isTopMatch={isTopMatch}
                            nTab={nTab}
                            trackTeamName={trackTeamName}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

const LinkMatch = ({ match, isLast, isTopMatch, nTab }: MatchProps) => {
    const borderTopMatch = isTopMatch ? 'grow-border-topX' : ''
    const borderBotMatch = !isTopMatch ? 'grow-border-botX' : ''
    const animeLink = isTopMatch ? 'grow-border' : ''

    const delay = 0.3 * nTab + 's'
    const secondDelay = 0.3 * nTab + 0.3 + 's'

    return (
        <div className="h-full flex-3 flex flex-col">
            <div className="flex-5 flex relative">
                <div className="flex-5 relative">
                    <div
                        className={`${borderBotMatch}`}
                        style={{ animationDelay: delay }}
                    ></div>
                </div>
                <div className="flex-5"></div>
            </div>

            <div className="flex-5 flex relative">
                <div className="flex-5 relative">
                    <div
                        className={`${borderTopMatch}`}
                        style={{ animationDelay: delay }}
                    ></div>
                </div>

                <div className="flex-5 relative">
                    <div
                        className={`${animeLink}`}
                        style={{ animationDelay: secondDelay }}
                    />
                </div>
            </div>
        </div>
    )

    // const borderTopMatch = isTopMatch ? 'border-r-3 border-t-3' : ''
    // const borderBotMatch = !isTopMatch ? 'border-r-3 border-b-3' : ''
    // const borderLink = isTopMatch ? "border-b-3":""

    // return (
    //     <div className="h-full flex-3 flex flex-col">
    //         <div className="flex-5 flex">
    //             <div className={`flex-5 ${borderBotMatch}`}></div>
    //             <div className="flex-5"></div>
    //         </div>
    //         <div className="flex-5 flex">
    //             <div className={`flex-5 ${borderTopMatch}`}></div>
    //             <div className={`flex-5 ${borderLink}`}></div>
    //         </div>
    //     </div>
    // )
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
    isTopMatch,
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
