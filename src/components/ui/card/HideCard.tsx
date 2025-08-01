'use client'

import React from 'react'
import { useCard } from './Card'
import DropDownArrow, { useDropdownArrow } from '../Button/DropDownArrow'

interface classNameProps{
    className?:string
}

export const HideCard = ({ className = '' }: classNameProps) => {
    const {setIsHide, isHide} = useCard()
    const {isDown, setIsDown} = useDropdownArrow()

    return (
        <div
            className={` ${className}`}
            onClick={() => setIsHide(!isHide)}
        >
            <DropDownArrow isDown={isDown} setIsDown={setIsDown}/>
        </div>
    )
}
