'use client'

import React, { useState, useContext } from 'react'
import { createContext } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/utils/select'
import { SubTitle } from '@/components/ui/text/SubTitle'

export interface MainProps {
    children: React.ReactNode
    className?: string
}

export interface RowProps {
    className?: string
    display: string
    data: string[]
    all?: boolean
}

export const TabbleEntityLayout = ({ children, className = '' }: MainProps) => {
    return <div className={` ${className}`}>{children}</div>
}

export const TabbleEntityHeader = ({ children, className = '' }: MainProps) => {
    return <div className={`flex flex-col w-full ${className}`}>{children}</div>
}

export const TabbleEntityRow = ({
    className = '',
    display,
    data,
    all = true,
}: RowProps) => {
    console.log(data[-1])

    return (
        <div className={`flex justify-end h-[43px] ${className}`}>
            <div className='px-[15px]'>
            {display === 'select' ? (
                <Select defaultValue={data[data.length - 1]}>
                    <SelectTrigger className='border-none p-0 !ring-0 !focus-visible:ring-0 !focus-visible:border-none text-clear-grey font-semibold text-sm md:text-base select-none hover:text-white data-[state=open]:text-white [&_svg]:transition-colors'>
                        <SelectValue placeholder={data[data.length - 1]} />
                    </SelectTrigger>
                    <SelectContent className='bg-white-04 backdrop-blur text-clear-grey font-semibold text-sm md:text-base'>
                        {data.map((item, index) => (
                            <SelectItem key={index} value={item}>
                                {item}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <div className='flex justify-end gap-3'>
                    {data.map((item, index) => (
                        <SubTitle className='hover:text-white cursor-pointer select-none'>{item}</SubTitle>
                    ))}
                </div>
            )}
            </ div>
        </div>
    )
}
