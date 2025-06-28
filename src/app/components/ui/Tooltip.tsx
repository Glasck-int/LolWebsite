'use client'

import React, {
    useState,
    RefObject,
    useLayoutEffect,
    useRef,
    ReactNode,
} from 'react'
import { Info } from 'lucide-react'

interface TooltipProps {
    children: React.ReactNode
}

interface ToolTipMessageProps {
    children: ReactNode
    align?: 'start' | 'center' | 'end'
    isVisible?: boolean
    containerRef?: HTMLElement | null
}

interface ToolTipBodyProps {
    children?: ReactNode
}

/**
 * ToolTipMessage
 *
 * Affiche le message de la tooltip. Peut s'aligner à gauche, au centre ou à droite
 * du parent, et s'adapte à la largeur d'un conteneur donné.
 *
 * @param children - Le contenu textuel ou JSX du message affiché dans la tooltip.
 * @param align - Alignement horizontal du tooltip par rapport au déclencheur : 'start' | 'center' | 'end' (défaut: 'center').
 * @param isVisible - Si la tooltip doit être visible ou non.
 * @param containerRef - Élément DOM de référence pour ajuster dynamiquement la largeur.
 *
 * @returns Une bulle d’aide stylisée positionnée au-dessus de son parent.
 *
 * @example
 * ```tsx
 * <ToolTipMessage align="end" isVisible={visible} containerRef={containerElement}>
 *   <p>Texte de tooltip</p>
 * </ToolTipMessage>
 * ```
 *
 * @remarks
 * Utilise `useLayoutEffect` pour mesurer dynamiquement la largeur. Supporte l’alignement du message
 * ainsi qu’un fallback si aucun `containerRef` n’est fourni.
 *
 * @see Tooltip, ToolTipBody
 */
export const ToolTipMessage = ({
    children,
    align = 'center',
    isVisible,
    containerRef,
}: ToolTipMessageProps) => {
    const [width, setWidth] = useState<number | undefined>(undefined)
    const tooltipRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        if (isVisible) {
            if (containerRef) {
                const availableWidth =
                    containerRef.getBoundingClientRect().width
                console.log('width container ref = ' + availableWidth)
                setWidth(availableWidth)
            } else if (tooltipRef.current) {
                const tooltipRect =
                    tooltipRef.current.getBoundingClientRect().width
                console.log('actual ref', tooltipRef)
                console.log('width = ' + tooltipRect)
                setWidth(tooltipRect)
            }
        }
    }, [isVisible, containerRef])

    const alignClass = {
        start: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        end: 'right-0',
    }[align]

    const alignData = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
    }[align]

    return (
        <div className="relative flex items-center" ref={tooltipRef}>
            {isVisible && (
                <div
                    className={`absolute bottom-full text-white text-sm rounded z-49 mb-2 ${alignClass} `}
                    style={{ width: `${width}px`, maxWidth: `${width}px`}}
                >
                    <div className={`flex ${alignData} w-full`}>
                        <div className=" bg-black rounded px-2 py-1 break-words">
                            {children}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

/**
 * ToolTipBody
 *
 * Élément déclencheur de la tooltip, généralement une icône ou un texte.
 * Peut être personnalisé, ou affiche par défaut une icône `Info`.
 *
 * @param children - JSX facultatif affiché comme le trigger de la tooltip. Si non fourni, une icône Info est affichée.
 *
 * @returns Un élément interactif qui déclenche l’apparition du `ToolTipMessage` au survol.
 *
 * @example
 * ```tsx
 * <ToolTipBody>
 *   <span>?</span>
 * </ToolTipBody>
 * ```
 *
 * @remarks
 * À placer dans le composant `Tooltip` pour fonctionner correctement.
 *
 * @see Tooltip, ToolTipMessage
 */
export const ToolTipBody = ({ children }: ToolTipBodyProps) => {
    return (
        <div>
            {children ? children : <Info color="#dddddd" />}
        </div>
    )
}

/**
 * Tooltip
 *
 * Composant parent qui gère l’état de visibilité de la tooltip (`onMouseEnter` / `onMouseLeave`)
 * et injecte automatiquement la prop `isVisible` dans `ToolTipMessage`.
 *
 * @param children - Composants enfants (idéalement `ToolTipMessage` et `ToolTipBody`).
 *
 * @returns Un wrapper qui rend les enfants interactifs, affichant la tooltip lors du survol.
 *
 * @example
 * ```tsx
 * <Tooltip>
 *   <ToolTipMessage>Contenu</ToolTipMessage>
 *   <ToolTipBody />
 * </Tooltip>
 * 
 * ------------------
 * 
 * const [self, setSelf] = useState<HTMLElement | null>(null)
 * const selfRef = useRef<HTMLDivElement>(null)
 *
 * useEffect(() => {
 *     setSelf(selfRef.current)
 * }, [])
 *
 * return (
 *    <div ref={selfRef} className="w-full flex justify-between">
 *        <span>Contenu principal</span>
 *        <Tooltip>
 *            <ToolTipMessage align="end" containerRef={self}>
 *                <p>Message super long qui suit la largeur du conteneur parent</p>
 *            </ToolTipMessage>
 *            <ToolTipBody />
 *        </Tooltip>
 *    </div>
 *)
 * ```
 *
 * @remarks
 * Gère `visible` en interne avec `useState`, sans nécessiter de gestion externe.
 *
 * @see ToolTipMessage, ToolTipBody
 */
export const Tooltip = ({ children }: TooltipProps) => {
    const [visible, setVisible] = useState(false)

    const enhancedChildren = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(
                child as React.ReactElement<ToolTipMessageProps>,
                {
                    isVisible: visible,
                }
            )
        }
        return child
    })

    return (
        <div
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {enhancedChildren}
        </div>
    )
}
