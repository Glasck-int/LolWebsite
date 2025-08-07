import { Page, Match } from "./PlayoffBracket";

export function extractPageNames(tournamentData: Page[]): string[] {
  return tournamentData.map((page) => page.pageName);
}

export const findPageByName = (pages: Page[], pageName: string): Page => {
    const foundPage = pages.find((page) => page.pageName === pageName)
    return foundPage ?? pages[0]
}

export const extractTeamInfo = (match: Match, team: number) => {
	if (team !== 0 && team !== 1) {
		throw new Error("team must be 0 or 1");
	}

	const isTeamA = team === 0;

	const name = isTeamA ? match.teamA : match.teamB;
	const short = isTeamA ? match.shortA : match.shortB;
	const score = isTeamA ? match.team1Score : match.team2Score;
	const opponentScore = isTeamA ? match.team2Score : match.team1Score;

	return {
		name,
		short,
		score,
		asWin: score > opponentScore,
	};
}

export const getLoserMatch = (match:Match) => {
	return match.team1Score > match.team2Score ? match.teamB : match.teamA
}

export const getWinnerMatch = (match:Match) => {
	return match.team1Score > match.team2Score ? match.teamA : match.teamB
}

export function hasTeamLost(alreadyLost: Set<string>, match: Match): boolean {
    return alreadyLost.has(match.teamA) || alreadyLost.has(match.teamB);
}