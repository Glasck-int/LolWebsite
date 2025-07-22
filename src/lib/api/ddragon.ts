const DDragonBase = 'https://ddragon.leagueoflegends.com'

interface ChampionInfo {
    version: string
    id: string
    key: string
    name: string
    title: string
    blurb: string
    info: {
        attack: number
        defense: number
        magic: number
        difficulty: number
    }
    image: {
        full: string
        sprite: string
        group: string
        x: number
        y: number
        w: number
        h: number
    }
    tags: string[]
    partype: string
    stats: {
        hp: number
        hpperlevel: number
        mp: number
        mpperlevel: number
        movespeed: number
        armor: number
        armorperlevel: number
        spellblock: number
        spellblockperlevel: number
        attackrange: number
        hpregen: number
        hpregenperlevel: number
        mpregen: number
        mpregenperlevel: number
        crit: number
        critperlevel: number
        attackdamage: number
        attackdamageperlevel: number
        attackspeedperlevel: number
        attackspeed: number
    }
}

interface ChampionData {
    type: string
    format: string
    version: string
    data: Record<string, ChampionInfo>
}

interface ChampionDetails extends ChampionInfo {
    skins: Array<{
        id: string
        num: number
        name: string
        chromas: boolean
    }>
    lore: string
    allytips: string[]
    enemytips: string[]
    spells: Array<{
        id: string
        name: string
        description: string
        tooltip: string
        leveltip: {
            label: string[]
            effect: string[]
        }
        maxrank: number
        cooldown: number[]
        cooldownBurn: string
        cost: number[]
        costBurn: string
        datavalues: Record<string, unknown>
        effect: (number[] | null)[]
        effectBurn: (string | null)[]
        vars: unknown[]
        costType: string
        maxammo: string
        range: number[]
        rangeBurn: string
        image: {
            full: string
            sprite: string
            group: string
            x: number
            y: number
            w: number
            h: number
        }
        resource: string
    }>
    passive: {
        name: string
        description: string
        image: {
            full: string
            sprite: string
            group: string
            x: number
            y: number
            w: number
            h: number
        }
    }
}

interface ItemData {
    type: string
    version: string
    data: Record<string, {
        name: string
        description: string
        colloq: string
        plaintext: string
        into: string[]
        image: {
            full: string
            sprite: string
            group: string
            x: number
            y: number
            w: number
            h: number
        }
        gold: {
            base: number
            purchasable: boolean
            total: number
            sell: number
        }
        tags: string[]
        maps: Record<string, boolean>
        stats: Record<string, number>
    }>
}

interface SummonerSpellData {
    type: string
    version: string
    data: Record<string, {
        id: string
        name: string
        description: string
        tooltip: string
        maxrank: number
        cooldown: number[]
        cooldownBurn: string
        cost: number[]
        costBurn: string
        datavalues: Record<string, unknown>
        effect: (number[] | null)[]
        effectBurn: (string | null)[]
        vars: unknown[]
        key: string
        summonerLevel: number
        modes: string[]
        costType: string
        maxammo: string
        range: number[]
        rangeBurn: string
        image: {
            full: string
            sprite: string
            group: string
            x: number
            y: number
            w: number
            h: number
        }
        resource: string
    }>
}

interface RuneData {
    id: number
    key: string
    icon: string
    name: string
    slots: Array<{
        runes: Array<{
            id: number
            key: string
            icon: string
            name: string
            shortDesc: string
            longDesc: string
        }>
    }>
}

export class DDragon {
    static async getVersions(): Promise<string[]> {
        const res = await fetch(`${DDragonBase}/api/versions.json`)
        return res.json()
    }

    static async getLanguages(): Promise<string[]> {
        const res = await fetch(`${DDragonBase}/cdn/languages.json`)
        return res.json()
    }

    static async getChampions(version: string, locale = 'en_US'): Promise<ChampionData> {
        const res = await fetch(
            `${DDragonBase}/cdn/${version}/data/${locale}/champion.json`
        )
        return res.json()
    }

    static async getChampionDetails(
        version: string,
        championName: string,
        locale = 'en_US'
    ): Promise<{ data: Record<string, ChampionDetails> }> {
        const res = await fetch(
            `${DDragonBase}/cdn/${version}/data/${locale}/champion/${championName}.json`
        )
        return res.json()
    }

    static async getItems(version: string, locale = 'en_US'): Promise<ItemData> {
        const res = await fetch(
            `${DDragonBase}/cdn/${version}/data/${locale}/item.json`
        )
        return res.json()
    }

    static async getSummonerSpells(
        version: string,
        locale = 'en_US'
    ): Promise<SummonerSpellData> {
        const res = await fetch(
            `${DDragonBase}/cdn/${version}/data/${locale}/summoner.json`
        )
        return res.json()
    }

    static async getRunes(version: string, locale = 'en_US'): Promise<RuneData[]> {
        const res = await fetch(
            `${DDragonBase}/cdn/${version}/data/${locale}/runesReforged.json`
        )
        return res.json()
    }

    static getChampionIcon(version: string, championName: string): string {
        return `${DDragonBase}/cdn/${version}/img/champion/${championName}.png`
    }

    static getChampionSplash(championName: string, skinNum = 0): string {
        return `${DDragonBase}/cdn/img/champion/splash/${championName}_${skinNum}.jpg`
    }

    static getItemIcon(version: string, itemId: string): string {
        return `${DDragonBase}/cdn/${version}/img/item/${itemId}.png`
    }

    static getSummonerSpellIcon(version: string, spellName: string): string {
        return `${DDragonBase}/cdn/${version}/img/spell/${spellName}.png`
    }
}
