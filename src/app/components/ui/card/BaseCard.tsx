"use client";

interface BaseCardProps {
    Body: React.FC<{ className?:string}>
    Header: React.FC<{ className?:string}>
}

export const BaseCard = ({Body, Header}: BaseCardProps) => {
    return(
        <div className="bg-white-06 default-border-radius h-full w-full flex flex-col justify-between ">
            <Header className="bg-white-04"/>
            <Body className="h-full"/>
        </div>
    )
}