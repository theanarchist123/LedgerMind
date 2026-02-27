"use client"

import { motion, useMotionValue, useSpring } from "framer-motion"
import { useEffect, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MagneticProps {
    children: ReactNode
    className?: string
    strength?: number
}

export function Magnetic({ children, className, strength = 0.3 }: MagneticProps) {
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const springX = useSpring(x, { stiffness: 300, damping: 30 })
    const springY = useSpring(y, { stiffness: 300, damping: 30 })

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        x.set((e.clientX - centerX) * strength)
        y.set((e.clientY - centerY) * strength)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            className={cn(className)}
            style={{ x: springX, y: springY }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </motion.div>
    )
}

interface SpotlightProps {
    className?: string
    fill?: string
}

export function Spotlight({ className, fill = "rgba(16,185,129,0.07)" }: SpotlightProps) {
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            x.set(e.clientX)
            y.set(e.clientY)
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [x, y])

    return (
        <motion.div
            className={cn("pointer-events-none fixed inset-0 z-30 transition duration-300", className)}
            style={{
                background: `radial-gradient(600px at ${x}px ${y}px, ${fill}, transparent 80%)`,
            }}
        />
    )
}

interface RevealProps {
    children: ReactNode
    className?: string
    delay?: number
}

export function RevealMask({ children, className, delay = 0 }: RevealProps) {
    return (
        <div className={cn("overflow-hidden pb-[0.2em] mb-[-0.2em]", className)}>
            <motion.div
                initial={{ y: "100%", opacity: 0 }}
                whileInView={{ y: "0%", opacity: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                    duration: 0.9,
                    delay,
                    ease: [0.25, 0.4, 0.25, 1],
                }}
            >
                {children}
            </motion.div>
        </div>
    )
}

interface ParallaxProps {
    children: ReactNode
    className?: string
    speed?: number
}

export function ParallaxDiv({ children, className }: ParallaxProps) {
    return (
        <div className={cn("will-change-transform", className)}>
            {children}
        </div>
    )
}
