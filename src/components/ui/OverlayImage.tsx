import Image from 'next/image'

interface OverlayImageProps {
    mainUrl: string
    bottomUrl: string
    mainAlt: string
    bottomAlt: string
    size?: number
    bottomSize?: number
    className?: string
}

export default function OverlayImage({
    mainUrl,
    bottomUrl,
    mainAlt,
    bottomAlt,
    size = 56,
    bottomSize = 32,
    className = ""
}: OverlayImageProps) {
    return (
        <div className={`relative ${className}`}>
            <Image
                src={mainUrl}
                alt={mainAlt}
                width={size}
                height={size}
                className="rounded-full object-cover aspect-square"
            />
            <div className="absolute -bottom-2 -left-2">
                <Image 
                    src={bottomUrl} 
                    alt={bottomAlt} 
                    width={bottomSize} 
                    height={bottomSize}
                />
            </div>
        </div>
    )
}