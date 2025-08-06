import { ButtonBar } from '@/components/ui/Button/ButtonBar'
import { getTeamImageByName } from '@/lib/api/image'
import React, { useState } from 'react'
import { extractPageNames, findPageByName, extractTeamInfo } from './utils'
import Image from 'next/image'

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
}

interface PageProps {
	page: Page
}

interface MatchProps {
	match: Match
	isLast:boolean
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
	isLast: boolean;
}

interface TeamLineContainerProps {
	team: Team;
	position: 'top' | 'bottom';
}

interface TabHeaderProps {
	tabName: string;
	isLast: boolean;
}

export const PlayoffBracket = ({ tournaments }: PlayoffProps) => {
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
            <Page page={pageSelected} />
        </div>
    )
}

const Page = ({ page }: PageProps) => {
    return (
        <div className="w-full flex flex-10">
            {page.tabs.map((tab, index) => (
                <Tab 
                    key={index}
                    tab={tab} 
                    isLast={index === page.tabs.length - 1}
                />
            ))}
        </div>
    )
}

const Tab = ({ tab, isLast }: TabProps) => {
    return (
        <div className={`h-auto ${isLast ? 'flex-7' : 'flex-10'}`}>
            <div className="h-full flex-1 flex flex-col gap-6">
                <TabHeader tabName={tab.tabName} isLast={isLast} />
                <div className="flex flex-col gap-6 h-full">
                    {tab.matchs.map((match, index) => (
                        <Match key={index} match={match} isLast={isLast} />
                    ))}
                </div>
            </div>
        </div>
    )
}

const TabHeader = ({ tabName, isLast }: TabHeaderProps) => {
    return (
        <div className="h-12 flex items-center justify-left">
            <div className={`${isLast ? "w-10/10" : "flex-7"} flex items-center justify-center min-w-38`}>
                <p className="font-semibold">{tabName}</p>
            </div>
			{!isLast && <div className="h-full flex-3"></div>}
        </div>
    )
}

const Match = ({ match, isLast }: MatchProps) => {
    return (
        <div className="flex-1">
            <div className="flex w-full h-full">
                <VsCard match={match} isLast={isLast} />
                {!isLast && <div className="h-full flex-3"></div>}
            </div>
        </div>
    )
}

const VsCard = ({ match, isLast }: MatchProps) => {
    const teamA = extractTeamInfo(match, 0)
    const teamB = extractTeamInfo(match, 1)
    const url = 'http://49.13.26.198:8080/static/teamPng/Karmine Corplogo square.webp'
    
    const teamAWithImage = { ...teamA, imageUrl: url || '' }
    const teamBWithImage = { ...teamB, imageUrl: url || '' }
    
    return (
        <div className={`flex flex-col default-border-radius ${isLast ? "w-10/10" : "flex-7"} justify-center min-w-38`}>
            <TeamLineContainer team={teamAWithImage} position="top" />
            <TeamLineContainer team={teamBWithImage} position="bottom" />
        </div>
    )
}

const TeamLineContainer = ({ team, position }: TeamLineContainerProps) => {
    const baseClasses = 'w-full h-8 bg-white-06'
    const borderClasses = position === 'top' 
        ? 'border-b-1 border-dark-grey default-top-border-radius'
        : 'default-bot-border-radius backdrop-blur'
    
    return (
        <div className={`${baseClasses} ${borderClasses}`}>
            <DisplayTeamLine {...team} />
        </div>
    )
}

const DisplayTeamLine = ({ name, short, score, imageUrl }: Team) => {
    return (
        <div className="flex justify-between px-4 pr-6 items-center h-full">
            <div className="flex items-center gap-2">
                {imageUrl && (
                    <Image src={imageUrl} width={20} height={20} alt={name} />
                )}
                <p className="text-sm font-semibold">{short}</p>
            </div>
            <p className="text-sm font-semibold">{score}</p>
        </div>
    )
}
