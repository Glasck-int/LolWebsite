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
} from '@/components/ui/card/index'

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
                                <div className="flex gap-4">
                                    <CardHeaderSortContent sortName={'alpha'}>
                                        <p className="text-inherit">alpha</p>
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
