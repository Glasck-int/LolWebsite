'use client'

import React from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

/**
 * Wrapper component for React Query DevTools
 * Isolated to handle any potential issues
 */
export function DevTools() {
    // Only render in development
    if (process.env.NODE_ENV !== 'development') {
        return null
    }

    return (
        <ReactQueryDevtools 
            initialIsOpen={true}
            position="bottom"
        />
    )
}