"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface GridBackgroundProps {
    className?: string
    dotColor?: string
    size?: number
}

export function GridBackground({ className, dotColor = "rgba(16,185,129,0.15)", size = 40 }: GridBackgroundProps) {
    return (
        <div
            className={cn("absolute inset-0 pointer-events-none", className)}
            style={{
                backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
                backgroundSize: `${size}px ${size}px`,
            }}
        />
    )
}

interface NoiseBgProps {
    className?: string
    opacity?: number
}

export function NoiseBackground({ className, opacity = 0.04 }: NoiseBgProps) {
    return (
        <div
            className={cn("absolute inset-0 pointer-events-none", className)}
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                opacity,
            }}
        />
    )
}

interface GradientOrbProps {
    className?: string
    color?: string
    size?: number
}

export function GradientOrb({ className, color = "emerald", size = 600 }: GradientOrbProps) {
    const colorMap: Record<string, string> = {
        emerald: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
        green: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)",
        amber: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
        blue: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
        purple: "radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)",
    }

    return (
        <div
            className={cn("absolute pointer-events-none rounded-full", className)}
            style={{
                width: size,
                height: size,
                background: colorMap[color] ?? colorMap.emerald,
                filter: "blur(40px)",
            }}
        />
    )
}

interface LinePatternProps {
    className?: string
}

export function DiagonalLines({ className }: LinePatternProps) {
    return (
        <div
            className={cn("absolute inset-0 pointer-events-none opacity-[0.03]", className)}
            style={{
                backgroundImage: `repeating-linear-gradient(
          -45deg,
          white,
          white 1px,
          transparent 1px,
          transparent 20px
        )`,
            }}
        />
    )
}
