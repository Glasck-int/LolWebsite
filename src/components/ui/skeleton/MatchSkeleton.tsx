import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
interface MatchSkeletonProps {
    count?: number
}

export const MatchSkeleton = ({ count = 1 }: MatchSkeletonProps) => {
    return (
        <Card className="flex flex-row w-full">
            {Array.from({ length: count }).map((_, idx) => {
                const isMiddleMatch = count > 1 && idx === 1

                let borderClasses = ''
                if (count > 1) {
                    if (count === 2) {
                        borderClasses =
                            idx === 1
                                ? 'border-l border-l-neutral-600 border-t-0 border-b-0'
                                : ''
                    } else if (count === 3) {
                        borderClasses = isMiddleMatch
                            ? 'border-l border-r border-l-neutral-600 border-r-neutral-600 border-t-0 border-b-0'
                            : ''
                    }
                }

                return (
                    <div
                        key={idx}
                        className={`flex flex-row items-center justify-center bg-transparent px-4 py-2 h-[170px] flex-1 rounded-none ${borderClasses}`}
                    >
                        {/* Team 1 skeleton */}
                        <div className="flex flex-col items-center w-16">
                            <Skeleton className="w-12 h-12 rounded mb-2 bg-neutral-700" />
                            <Skeleton className="w-8 h-5 rounded bg-neutral-700" />
                        </div>

                        {/* Match info skeleton */}
                        <div className="flex flex-col items-center flex-1 gap-3">
                            <Skeleton className="w-16 h-6 rounded bg-neutral-700" />
                            <Skeleton className="w-20 h-4 rounded bg-neutral-700" />
                        </div>

                        {/* Team 2 skeleton */}
                        <div className="flex flex-col items-center w-16">
                            <Skeleton className="w-12 h-12 rounded mb-2 bg-neutral-700" />
                            <Skeleton className="w-8 h-5 rounded bg-neutral-700" />
                        </div>
                    </div>
                )
            })}
        </Card>
    )
}
