import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export const MatchSkeleton = ( {
    className,
}: {
    className?: string
}) => {
    return (
        <div className={cn("bg-white-06 default-border-radius h-full w-full flex flex-col min-h-[170px] backdrop-blur overflow-hidden", className)}>
            <Skeleton className="w-full h-[45px] rounded-t-lg rounded-b-none bg-neutral-700" />
        </div>
    )
}
