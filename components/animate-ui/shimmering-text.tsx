"use client"

import { cn } from "@/lib/utils"

interface ShimmeringTextProps {
    text: string
    className?: string
}

export function ShimmeringText({ text, className }: ShimmeringTextProps) {
    return (
        <span
            className={cn(
                "inline-block bg-gradient-to-r from-white via-emerald-300 to-white bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]",
                className
            )}
        >
            {text}
        </span>
    )
}
