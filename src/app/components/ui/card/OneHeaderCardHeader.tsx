"use client";

import React from 'react';

interface OneHeaderCardHeaderProps {
    className : string
}

export const OneHeaderCardHeader = ({className}:OneHeaderCardHeaderProps) => {
    return (
        <div className={'h-[35px] w-full flex justify-between ' + className}>test</div>
    )
};