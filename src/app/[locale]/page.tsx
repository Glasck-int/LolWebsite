import Footer from '@/components/layout/Footer/Footer'
import {
    Card,
    CardBody,
    CardHeader,
    CardToolTip,
} from '@/components/ui/card/Card'

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen w-full">
            <div className="mt-40 h-72 p-5">
                <Card>
                    <CardHeader>
                        <CardToolTip info="tooltip info bad long ca mere wtf ca va faire quoi ? ">
                            <p>header</p>
                        </CardToolTip>
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
