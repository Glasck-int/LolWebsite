import React from 'react'

interface RoleIconProps {
  role: string | null | undefined
  size?: number
  className?: string
}

/**
 * Role icon component that displays League of Legends position icons
 */
export function RoleIcon({ role, size = 18, className = '' }: RoleIconProps) {
  if (!role) {
    return null
  }

  // Normalize role name for filename
  const normalizedRole = role.toLowerCase()
  const roleMap: Record<string, string> = {
    'top': 'Top',
    'jungle': 'Jungle', 
    'mid': 'Mid',
    'adc': 'Bot',
    'bot': 'Bot',
    'bottom': 'Bot',
    'support': 'Support'
  }

  const iconName = roleMap[normalizedRole] || 'Top' // Default to Top if unknown role

  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={`/assets/SVG/${iconName}.svg`}
        alt={`${role} role`}
        width={size}
        height={size}
        className="object-contain"
        onError={(e) => {
          // Hide image on error
          e.currentTarget.style.display = 'none'
        }}
      />
    </div>
  )
}