'use client'

import { Button } from '@/components/ui/Button/Button'
import { useState } from 'react'

/**
 * ButtonBar component properties
 *
 * Interface defining the props required for the ButtonBar component.
 *
 * @param options - Array of button labels to display in the bar
 * @param onButtonChange - Callback function called when a button selection changes
 * @param disableUnselect - If true, prevents unselecting the currently active button by clicking it again.
 * @param defaultActiveIndex - Index of the button to set as initially active (default: null).
 */
interface ButtonBarProps {
    options: string[]
    onButtonChange: (option: string | null) => void
    disableUnselect?: boolean
    defaultActiveIndex?: number | null
}

/**
 * ButtonBar Component
 *
 * A horizontal group of toggleable buttons allowing **single selection**.
 * One button can be active at a time. Clicking the active button will either
 * deselect it or do nothing based on `disableUnselect`.
 *
 * @param options - Array of button labels to display
 * @param onButtonChange - Callback triggered when the selection changes. Returns the selected option or `null` if deselected
 * @param disableUnselect - If `true`, prevents unselecting an already active button (default: `false`)
 * @param defaultActiveIndex - Optionally sets the index of the button that should be active on first render
 *
 * @returns A React element rendering the button group
 *
 * @example
 * ```tsx
 * <ButtonBar
 *   options={['All', 'Ongoing', 'Completed']}
 *   defaultActiveIndex={0}
 *   disableUnselect={true}
 *   onButtonChange={(val) => console.log('Selected:', val)}
 * />
 * ```
 *
 * @remarks
 * - Buttons are styled with `variant="selected"` if active, or `variant="base"` if inactive.
 * - Internal state handles the selected button index.
 */
export const ButtonBar = ({
    options,
    onButtonChange,
    disableUnselect = false,
    defaultActiveIndex = null,
}: ButtonBarProps) => {
    const [activeButtonIndex, setActiveButtonIndex] = useState<number | null>(
        defaultActiveIndex
    )

    const handleButtonClick = (option: string, index: number) => {
        const isSame = activeButtonIndex === index
        if (isSame && disableUnselect) {
            return
        }
        const newActiveIndex = isSame ? null : index
        const newValue = newActiveIndex !== null ? option : null

        setActiveButtonIndex(newActiveIndex)
        onButtonChange(newValue)
    }
    return (
        <div className="flex flex-row gap-2 w-fit">
            {options.map((option, index) => (
                <Button
                    key={index}
                    variant={activeButtonIndex === index ? 'selected' : 'base'}
                    onClick={() => handleButtonClick(option, index)}
                >
                    {option}
                </Button>
            ))}
        </div>
    )
}
