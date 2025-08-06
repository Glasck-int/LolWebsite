'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { HeaderActions } from '../../navigation/HeaderActions'
import { DropdownMenu } from '../../ui/DropdownMenu/DropdownMenu'

/**
 * Application header with scroll-responsive styling and expandable menu
 *
 * A fixed header component that changes its appearance based on scroll position
 * and can expand to show a dropdown menu with background image when the burger menu is activated.
 *
 * @returns A JSX element representing the application header with optional dropdown and overlay
 *
 * @example
 * ```ts
 * // Basic usage
 * <Header />
 * ```
 *
 * @remarks
 * The component uses a scroll event listener to track window scroll position.
 * When the burger menu is opened, it applies the same background image as the main page
 * and displays the dropdown menu as an extension of the header. The overlay
 * prevents interaction with page content while the menu is open.
 *
 * @see HeaderActions - Component containing header navigation and action elements
 * @see DropdownMenu - The expandable menu component
 */
export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // Prevent scroll when menu is open (mobile only)
    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 767px)')

        const updateOverflow = () => {
            if (isMenuOpen && mediaQuery.matches) {
                document.body.style.overflow = 'hidden'
            } else {
                document.body.style.overflow = ''
            }
        }

        updateOverflow()
        mediaQuery.addEventListener('change', updateOverflow)

        return () => {
            document.body.style.overflow = ''
            mediaQuery.removeEventListener('change', updateOverflow)
        }
    }, [isMenuOpen])

    return (
        <>
            {/* Header container with same background as main page */}
            <div className="w-full px-4 fixed top-0 left-0 z-50">
                {/* Header principal with exact same background as body */}
                <div
                    className="w-full h-[80px] relative"
                    style={{
                        background:
                            'url("/background2.jpg") no-repeat center center fixed',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed',
                    }}
                >
                    {/* Overlay for better text readability */}
                    {isMenuOpen && (
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-all duration-100 ease-in md:hidden" />
                    )}

                    <div className="relative flex flex-row justify-between items-center h-full max-w-[1280px] mx-auto ">
                        <Link href="/" className="cursor-pointer">
                            <Image
                                src="/assets/SVG/logotypo/glasckWhite.svg"
                                alt="logoglasck"
                                width={170}
                                height={28}
                            />
                        </Link>
                        <HeaderActions
                            isMenuOpen={isMenuOpen}
                            onMenuToggle={setIsMenuOpen}
                        />
                    </div>
                </div>

                {/* Menu dropdown with same background */}
                <DropdownMenu
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                />
            </div>

            {/* Dark clickable overlay below dropdown menu - mobile only */}
            <div
                className={`fixed top-[290px] left-0 w-full h-screen bg-black/60 backdrop-blur-sm z-40 transition-all duration-100 ease-in md:hidden ${
                    isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                onClick={() => setIsMenuOpen(false)}
            />
        </>
    )
}
