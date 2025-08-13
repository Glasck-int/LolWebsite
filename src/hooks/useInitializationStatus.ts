'use client'

import { create } from 'zustand'

interface InitializationState {
    isInitialized: boolean
    setInitialized: (value: boolean) => void
}

export const useInitializationStatus = create<InitializationState>((set) => ({
    isInitialized: false,
    setInitialized: (value: boolean) => set({ isInitialized: value })
}))