import Footer from '@/components/layout/Footer/Footer'

import {
    Card,
    CardSort,
    CardHeader,
    CardHeaderBase,
    CardHeaderColumn,
    CardHeaderContent,
    CardHeaderSelector,
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
} from '@/components/layout/TabbebEntityLayout/exemple/exemple'
import { Annoyed } from 'lucide-react'
import { SubTitle } from '@/components/ui/text/SubTitle'
import { SortedList } from '@/components/ui/card/exemple/BodySort'
import {
    TabbleEntityLayout,
    TabbleEntityHeader,
    TabbleEntityBody,
    TabbleEntityContent,
} from '@/components/layout/TabbebEntityLayout/TabbebEntityLayout'

const seasons = [
  {
    season: "s8",
    data: [
      {
        split: "winter",
        tournaments: [
          { tournament: "Regular", id: 11 },
          { tournament: "PlayOff", id: 12 }
        ]
      },
      {
        split: "spring",
        tournaments: [
          { tournament: "MainEvent", id: 13 },
          { tournament: "PlayOff", id: 14 }
        ]
      }
    ]
  },
  {
    season: "s9",
    data: [
      {
        split: "winter",
        tournaments: [
          { tournament: "Qualifiers", id: 21 },
          { tournament: "Knockout", id: 22 }
        ]
      },
      {
        split: "spring",
        tournaments: [
          { tournament: "Championship", id: 23 },
          { tournament: "Finale", id: 24 }
        ]
      },
      {
        split: "summer",
        tournaments: [
          { tournament: "Warmup", id: 25 },
          { tournament: "GrandFinal", id: 26 }
        ]
      }
    ]
  },
  {
    season: "s10",
    data: [
      {
        split: "winter",
        tournaments: [
          { tournament: "OpenBracket", id: 31 },
          { tournament: "Elimination", id: 32 }
        ]
      },
      {
        split: "group",
        tournaments: [
          { tournament: "UpperGroup", id: 33 },
          { tournament: "LowerGroup", id: 34 }
        ]
      }
    ]
  },
  {
    season: "s11",
    data: [
      {
        tournaments: [
          { tournament: "Winter Start", id: 51 },
          { tournament: "MidWinter", id: 52 }
        ]
      }
    ]
  },
  {
    season: "s12",
    data: [
      {
        split: "winter",
        tournaments: [
          { tournament: "Winter Start", id: 51 },
          { tournament: "MidWinter", id: 52 }
        ]
      },
      {
        split: "spring",
        tournaments: [
          { tournament: "Spring Open", id: 53 },
          { tournament: "Spring Showdown", id: 54 }
        ]
      },
      {
        split: "summer",
        tournaments: [
          { tournament: "Beach Brawl", id: 55 },
          { tournament: "Heatwave Finals", id: 56 }
        ]
      },
      {
        split: "group",
        tournaments: [
          { tournament: "Group Stage Alpha", id: 57 },
          { tournament: "Group Stage Omega", id: 58 }
        ]
      }
    ]
  }
]

export default function Home() {
    return (
        <div className="body-container">
            <div className=" h-[200px]">
                <Card>
                    <CardHeader>
                        <CardHeaderColumn>
                            <CardHeaderTab>
                                <CardHeaderContent>
                                    <p className="text-inherit">stp</p>
                                </CardHeaderContent>
                                <CardHeaderContent>
                                    <p className="text-inherit">fonctionne</p>
                                </CardHeaderContent>
                                <CardHeaderContent>
                                    <p className="text-inherit">fonctionne</p>
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
                                    <p>TODO switch context</p>
                                    <p>gerer le all + classname</p>
                                    <p>faire la version ordi du component</p>
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
                </Card>
            </div>
            ---
            <div>
                <TabbleEntityLayout>
                    {/* header */}
                    <Card>
                        <CardBody>
                            <TabbleEntityHeader seasons={seasons} />
                        </CardBody>
                        <CardFooter>
                            <CardFooterContent>
                                <p className="text-inherit">left</p>
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
                    <TabbleEntityBody>
                        <TabbleEntityContent>
                            <Left />
                        </TabbleEntityContent>
                        <TabbleEntityContent>
                            <Mid />
                        </TabbleEntityContent>
                        <TabbleEntityContent>
                            <Right />
                        </TabbleEntityContent>
                    </TabbleEntityBody>
                </TabbleEntityLayout>
            </div>
            ---
            <div className="h-[200px]">
                <Card>
                    <CardHeader>
                        <CardHeaderBase className="justify-between">
                            <SubTitle>header</SubTitle>
                            <CardHeaderSelector>
                                <CardHeaderContent>
                                    <Annoyed></Annoyed>
                                </CardHeaderContent>
                                <CardHeaderContent>
                                    <Annoyed></Annoyed>
                                </CardHeaderContent>
                                <CardHeaderContent>
                                    <Annoyed></Annoyed>
                                </CardHeaderContent>
                            </CardHeaderSelector>
                        </CardHeaderBase>
                    </CardHeader>
                    <CardBody>
                        <CardBodyMultiple>
                            <CardBodyMultipleContent>
                                <div className="flex justify-center items-center h-full">
                                    <p>body 1</p>
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
