import Footer from '@/components/layout/Footer/Footer'
import {
    Card,
    CardBody,
    CardHeader,
    CardToolTip,
    CardHeaderBase,
    CardHeaderColumn,
    CardHeaderTab,
    CardBodyMultiple,
    CardHeaderSelector,
} from '@/components/ui/card/Card'
import { Annoyed } from 'lucide-react'
import { SubTitle } from '@/components/ui/text/SubTitle'

export default function Home() {
    return (
        <div className="body-container">
            {/* <div className=" h-[200px]">
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
            <div className=" h-[200px]">
                <Card>
                    <CardHeader>
                        <CardHeaderColumn>
                            <CardHeaderTab>
                                <p className="text-inherit">stp</p>
                                <p className="text-inherit">fonctionne</p>
                                <p className="text-inherit">fonctionne</p>
                            </CardHeaderTab>
                            <CardHeaderBase>
                                <SubTitle>header</SubTitle>
                            </CardHeaderBase>
                        </CardHeaderColumn>
                    </CardHeader>
                    <CardBody>
                        <CardBodyMultiple>
                            <div className="flex justify-center items-center h-full">
                                <p>body 1</p>
                            </div>
                            <p>body 2</p>
                            <p>body 3</p>
                            <p>test</p>
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
                                <Annoyed></Annoyed>
                                <Annoyed></Annoyed>
                                <Annoyed></Annoyed>
                            </CardHeaderSelector>
                        </CardHeaderBase>
                    </CardHeader>
                    <CardBody>
                        <CardBodyMultiple>
                            <div className="flex justify-center items-center h-full">
                                <p>body 1</p>
                            </div>
                            <p>body 2</p>
                            <p>body 3</p>
                            <p>test</p>
                        </CardBodyMultiple>
                    </CardBody>
                </Card>
            </div> */}
            <Footer />
        </div>
    )
}
