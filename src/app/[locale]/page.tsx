import Footer from '@/components/layout/Footer/Footer'
import { Card } from '@/components/ui/card/Card'
import { CardSort, CardHeaderSortContent } from '@/components/ui/card/CardSort'
import {
    CardBody,
    CardBodyMultiple,
    CardBodyMultipleContent,
} from '@/components/ui/card/CardBody'
import {
    CardHeader,
    CardHeaderBase,
    CardHeaderColumn,
    CardHeaderContent,
    CardHeaderSelector,
    CardHeaderTab,
} from '@/components/ui/card/CardHeader'

import { Annoyed } from 'lucide-react'
import { SubTitle } from '@/components/ui/text/SubTitle'
import { SortedList } from '@/components/ui/card/exemple/BodySort'

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
                                <div className="flex gap-2">
                                    <CardHeaderSortContent sortName={'aplha'}>
                                        <p className="text-inherit">apha</p>
                                    </CardHeaderSortContent>
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
