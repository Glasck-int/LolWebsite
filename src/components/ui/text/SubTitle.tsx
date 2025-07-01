import React, { ReactNode } from 'react'

interface SubTitleProps {
    children: ReactNode
}

export const SubTitle = ({children} : SubTitleProps) => {
  return (
    <p className='text-grey text-sm md:text-base'>{children}</p>
  )
}
