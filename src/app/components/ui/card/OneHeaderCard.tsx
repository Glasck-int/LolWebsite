"use client";

import { BaseCard } from './BaseCard';
import { OneHeaderCardHeader } from './OneHeaderCardHeader';
import React from 'react';

export const OneHeaderCard = () => {
    return (
        <BaseCard Body={OneHeaderCardHeader} Header={OneHeaderCardHeader}/>
    )
};
