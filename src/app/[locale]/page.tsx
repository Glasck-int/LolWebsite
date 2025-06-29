import Footer from '@/components/layout/Footer/Footer'
import {
    Card,
    CardBody,
    CardHeader,
    CardToolTip,
    CardOneHeader,
    CardDoubleHeader,
    CardDoubleHeaderBot,
} from '@/components/ui/card/Card'
import { SubTitle } from '@/components/ui/text/SubTitle'

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen w-full">
            <div className="mt-40 h-100 p-5 flex flex-col gap-1.5">
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

                <Card>
                    <CardHeader>
                        <CardOneHeader>
                            <SubTitle>header</SubTitle>
                        </CardOneHeader>
                    </CardHeader>
                    <CardBody>
                        <p>simple message</p>
                    </CardBody>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDoubleHeader>
                            <CardDoubleHeaderBot>
                                <SubTitle>header</SubTitle>
                            </CardDoubleHeaderBot>
                        </CardDoubleHeader>
                    </CardHeader>
                    <CardBody>
                        <p>simple message</p>
                    </CardBody>
                </Card>
            </div>
            <Footer />
        </div>
    )
}
