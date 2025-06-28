'use client'

import React from 'react'
import { Tooltip } from '../../Tooltip'


export const TestHeader = ({test}: {test: string}) => {
    return (
        <div className='flex gap-2'>
            <p>mon titre</p>
            <p>{test}</p>
            <Tooltip content="explication">
                <p>nombre de deces par minte</p>
            </Tooltip>
        </div>
    )
}