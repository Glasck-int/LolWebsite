'use client'
import React, { useState, useRef } from 'react'
import { League as LeagueType } from '@/generated/prisma'
import Image from 'next/image'

interface LeagueDescriptionClientProps {
    league: LeagueType
    imageData: string
}

export const LeagueDescriptionClient = ({ league, imageData }: LeagueDescriptionClientProps) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0, lightX: 50, lightY: 50 })
    const [dominantColor, setDominantColor] = useState('rgba(59, 130, 246, 0.5)')
    const cardRef = useRef<HTMLDivElement>(null)

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return
        
        const rect = cardRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        
        const rotateX = -(y - centerY) / 0.8
        const rotateY = (x - centerX) / 0.8
        
        // Position de la lumière (0-100% pour chaque axe)
        const lightX = (x / rect.width) * 100
        const lightY = (y / rect.height) * 100
        
        setMousePosition({ x: rotateX, y: rotateY, lightX, lightY })
    }

    const handleMouseLeave = () => {
        setMousePosition({ x: 0, y: 0, lightX: 50, lightY: 50 })
    }

    const extractDominantColor = (imageUrl: string) => {
        if (typeof window === 'undefined') return // Vérifier si on est côté client
        
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                if (!ctx) return

                canvas.width = img.width
                canvas.height = img.height
                ctx.drawImage(img, 0, 0)

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const data = imageData.data
                
                let r = 0, g = 0, b = 0, count = 0
                
                for (let i = 0; i < data.length; i += 4) {
                    const alpha = data[i + 3]
                    if (alpha > 128) { // Ignorer les pixels transparents
                        r += data[i]
                        g += data[i + 1]
                        b += data[i + 2]
                        count++
                    }
                }
                
                if (count > 0) {
                    r = Math.floor(r / count)
                    g = Math.floor(g / count)
                    b = Math.floor(b / count)
                    setDominantColor(`rgba(${r}, ${g}, ${b}, 0.6)`)
                }
            } catch (error) {
                console.warn('Erreur lors de l\'extraction de couleur:', error)
            }
        }
        img.onerror = () => {
            console.warn('Erreur lors du chargement de l\'image pour l\'extraction de couleur')
        }
        img.src = imageUrl
    }

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            extractDominantColor(imageData)
        }
    }, [imageData])

    return (
        <div className="w-[75px] h-[75px] [perspective:1000px] cursor-pointer">
            <div
                ref={cardRef}
                className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-300 rounded-lg"
                style={{
                    transform: `rotateX(${mousePosition.x}deg) rotateY(${mousePosition.y}deg)`
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <div className="absolute inset-0 [backface-visibility:hidden] rounded-lg">
                    <Image
                        src={imageData}
                        alt={league.name || ''}
                        className="object-contain w-full h-full drop-shadow-lg"
                        style={{
                            filter: `drop-shadow(0 0 8px ${dominantColor})`
                        }}
                        width={75}
                        height={75}
                    />
                </div>
            </div>
        </div>
    )
}