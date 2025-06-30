import React from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
}

export const Card = ({ children, className }: CardProps) => {
    return (
        <div
            className={
                'bg-white-06 default-border-radius h-full w-full flex flex-col justify-between backdrop-blur ' +
                className
            }
        >
            {children}
        </div>
    )
}

// pas mettre une min height mais juste mettre un padding top sur la carte masi trql on voit ca juste apres
// implement le toll tip dans le header je pense
export const CardHeader = ({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) => {
    return (
        <div
            className={
                'bg-white-04 px-[15px] flex items-center min-h-[35px] ' +
                className
            }
        >
            {children}
        </div>
    )
}

export const CardBody = ({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) => {
    return <div className={'h-full px-[15px] ' + className}>{children}</div>
}
