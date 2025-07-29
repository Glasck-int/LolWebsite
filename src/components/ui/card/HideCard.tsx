'use client'

import React, { useState } from 'react'
import { useCard } from './Card'
import DropDownArrow, { getStateArrow } from '../Button/DropDownArrow'

interface classNameProps{
    className?:string
}

export const HideCard = ({ className = '' }: classNameProps) => {
    const {setIsHide, isHide} = useCard()
    const {isDown, setIsDown} = getStateArrow()

    return (
        <div
            className={` ${className}`}
            onClick={() => setIsHide(!isHide)}
        >
            <DropDownArrow isDown={isDown} setIsDown={setIsDown}/>
        </div>
    )
}
