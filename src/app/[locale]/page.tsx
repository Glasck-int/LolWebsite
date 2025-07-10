import Footer from '@/components/layout/Footer/Footer'
import {
    Card,
    CardBody,
    CardHeader,
    CardToolTip,
    CardHeaderBase,
    CardHeaderColumn,
    CardHeaderTab,
    CardHeaderTabContent,
    CardBodyMultiple,
    CardBodyMultipleContent,
    CardHeaderSelector,
} from '@/components/ui/card/Card'
import {
    CardHeaderSort,
    CardHeaderSortContent,
} from '@/components/ui/card/CardSort'

import { Annoyed } from 'lucide-react'
import { SubTitle } from '@/components/ui/text/SubTitle'
import { SortedList } from '@/components/ui/card/exemple/BodySort'

export default function Home() {
    return (
        <div className="body-container">
            <div className=" h-[200px]">
                <Card>
                    <CardHeader>
                        <CardToolTip info="tooltip info bad long ca mere wtf ca va faire quoi ? ">
                            <SubTitle>Header</SubTitle>
                        </CardToolTip>
                    </CardHeader>
                    <CardBody>
                        <p>simple message</p>
                    </CardBody>
                </Card>
            </div>
            ---
            <div className=" h-[200px]">
                <Card>
                    <CardHeader>
                        <CardHeaderBase>
                            <SubTitle>header</SubTitle>
                        </CardHeaderBase>
                    </CardHeader>
                    <CardBody>
                        <p>simple message</p>
                    </CardBody>
                </Card>
            </div>
            ---
            {/* <div className=" h-[200px]">
                <Card>
                    <CardHeader>
                        <CardHeaderColumn>
                            <CardHeaderTab>
                                <CardHeaderTabContent>
                                    <p className="text-inherit">stp</p>
                                </CardHeaderTabContent>
                                <CardHeaderTabContent>
                                    <p className="text-inherit">fonctionne</p>
                                </CardHeaderTabContent>
                                <CardHeaderTabContent>
                                    <p className="text-inherit">fonctionne</p>
                                </CardHeaderTabContent>
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
                                <CardHeaderTabContent>
                                    <Annoyed></Annoyed>
                                </CardHeaderTabContent>
                                <CardHeaderTabContent>
                                    <Annoyed></Annoyed>
                                </CardHeaderTabContent>
                                <CardHeaderTabContent>
                                    <Annoyed></Annoyed>
                                </CardHeaderTabContent>
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
            </div> */}
            ---
            <div className="">
                <Card>
                    <CardHeaderSort>
                        <CardHeader>
                            <CardHeaderBase className="flex justify-between">
                                <SubTitle>Header</SubTitle>
                                <div className='flex gap-2'>
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
                    </CardHeaderSort>
                </Card>
            </div>
            <Footer />
        </div>
    )
}
