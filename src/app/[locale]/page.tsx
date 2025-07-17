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

import { Left, Right, Mid } from '@/components/layout/TabbebEntityLayout/exemple/exemple'
import { Annoyed } from 'lucide-react'
import { SubTitle } from '@/components/ui/text/SubTitle'
import { SortedList } from '@/components/ui/card/exemple/BodySort'
import { TabbleEntityLayout, TabbleEntityHeader, TabbleEntityBody, TabbleEntityContent } from '@/components/layout/TabbebEntityLayout/TabbebEntityLayout'

const DropDownExemple = ["2021", "2022", "2023", "2024", "2025"]
const row1Exemple = ['winter', 'MainEvent', 'Spring']
const row2Exemple = ['Regular Season', 'Playoff']
const seasons: {
  [year: string]: {
    split: string[];
    tournament: string[];
  };
} = {
  "2025": {
    split: ["Winter", "MainEvent", "Spring"],
    tournament: ["RegularSeason", "Playoff"]
  },
  "2024": {
    split: ["PreSeason", "MidSeason", "Summer"],
    tournament: ["RegularSeason", "Finals"]
  },
  "2023": {
    split: ["EarlySeason", "Championship", "Fall"],
    tournament: ["Qualifiers", "Playoffs"]
  },
  "2022": {
    split: ["Opening", "MidSeason", "EndSeason"],
    tournament: ["GroupStage", "Knockout"]
  },
  "2021": {
    split: ["Start", "MidYear", "LateYear"],
    tournament: ["Elimination", "FinalMatch"]
  }
};

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
                            <TabbleEntityHeader data={seasons} />
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
                            <Left/>
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
