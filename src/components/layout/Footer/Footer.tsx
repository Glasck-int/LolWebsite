'use client'
import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useTranslate } from '../../../lib/hooks/useTranslate'
import {
    FooterMobile,
    FooterItem,
} from '@/components/layout/Footer/FooterMobile'
import { Trophy } from 'lucide-react'
import { Swords } from 'lucide-react'
import Link from 'next/link'

function Footer() {
    const t = useTranslate('Footer')
    const locale = useLocale()
    const pathname = usePathname()
    const isMatchs = pathname === `/${locale}`
    const isLeagues = pathname === `/${locale}/leagues`

    return (
        <FooterMobile>
            <FooterItem>
                <Link
                    href="/"
                    className="flex flex-col items-center justify-center"
                >
                    <Swords
                        className={`w-5 h-5 cursor-pointer ${
                            isMatchs ? 'text-clear-violet' : 'text-clear-grey'
                        }`}
                    />
                    <p
                        className={`text-sm text-center font-semibold ${
                            isMatchs ? 'text-clear-violet' : 'text-clear-grey'
                        }`}
                    >
                        {t('Matchs')}
                    </p>
                </Link>
            </FooterItem>
            <FooterItem>
                <Link
                    href="/leagues"
                    className="flex flex-col items-center justify-center"
                >
                    <Trophy
                        className={`w-5 h-5 cursor-pointer ${
                            isLeagues ? 'text-clear-violet' : 'text-clear-grey'
                        }`}
                    />
                    <p
                        className={`text-sm text-center font-semibold ${
                            isLeagues ? 'text-clear-violet' : 'text-clear-grey'
                        }`}
                    >
                        {t('Leagues')}
                    </p>
                </Link>
            </FooterItem>
        </FooterMobile>
    )
}

export default Footer
