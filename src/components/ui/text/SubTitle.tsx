import React, { ReactNode } from 'react'

interface SubTitleProps {
    children: ReactNode
    className?: string
}

export const SubTitle = ({children, className=''} : SubTitleProps) => {
  return (
    <p className={`text-clear-grey text-sm md:text-base ${className}`}>{children}</p>
  )
}
