'use client'

interface BaseCardProps {
    Header: (props: { className: string }) => React.ReactNode
    children: React.ReactNode
}

export const BaseCard = ({ children, Header }: BaseCardProps) => {
    return (
        <div className="bg-white-06 default-border-radius h-full w-full flex flex-col justify-between">
            <Header className="bg-white-04 px-[15px] flex items-center" />
            <div className="h-full px-[15px]">{children}</div>
        </div>
    )
}
