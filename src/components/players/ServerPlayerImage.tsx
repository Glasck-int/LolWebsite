import Image from 'next/image'
import { getCachedPlayerImage } from '@/lib/cache/playerImageCache'

interface ServerPlayerImageProps {
  playerName: string
  tournament?: string
  width?: number
  height?: number
  className?: string
  alt?: string
  fallbackComponent?: React.ReactNode
}

/**
 * Server Component that renders player images with server-side caching
 * Uses unstable_cache for persistent caching across requests
 */
export default async function ServerPlayerImage({
  playerName,
  tournament,
  width = 32,
  height = 32,
  className = "rounded-full object-cover aspect-square",
  alt,
  fallbackComponent
}: ServerPlayerImageProps) {
  const imageData = await getCachedPlayerImage(playerName, tournament)
  
  if (!imageData?.url) {
    return fallbackComponent || (
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-dark-grey to-clear-violet/50 flex items-center justify-center flex-shrink-0 ring-1 ring-white/10`}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path
            d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M3 22C3 17.5817 6.58172 14 11 14H13C17.4183 14 21 17.5817 21 22H3Z"
            fill="currentColor"
            opacity="0.8"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className="relative flex-shrink-0">
      <Image
        src={imageData.url}
        alt={alt || `${playerName} avatar`}
        width={width}
        height={height}
        className={className}
        // Server components can't use onError, but Next.js handles fallbacks
        priority={imageData.priority > 500} // High priority for important images
      />
    </div>
  )
}

/**
 * Simplified version for use in tables and lists
 */
export async function ServerPlayerAvatar({
  playerName,
  tournament,
  size = 32
}: {
  playerName: string
  tournament?: string
  size?: number
}) {
  return (
    <ServerPlayerImage
      playerName={playerName}
      tournament={tournament}
      width={size}
      height={size}
      className="rounded-full object-cover aspect-square"
      alt={`${playerName} avatar`}
    />
  )
}