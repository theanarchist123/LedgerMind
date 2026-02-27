"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"
import { cn } from "@/lib/utils"

interface CountingNumberProps {
    value: number
    duration?: number
    className?: string
    prefix?: string
    suffix?: string
    decimals?: number
}

export function CountingNumber({
    value,
    duration = 2.5,
    className,
    prefix = "",
    suffix = "",
    decimals = 0,
}: CountingNumberProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-60px" })
    const motionValue = useMotionValue(0)
    const springValue = useSpring(motionValue, {
        damping: 50,
        stiffness: 100,
        duration,
    })
    const [display, setDisplay] = useState("0")

    useEffect(() => {
        if (isInView) {
            motionValue.set(value)
        }
    }, [isInView, motionValue, value])

    useEffect(() => {
        const unsub = springValue.on("change", (latest) => {
            setDisplay(latest.toFixed(decimals))
        })
        return unsub
    }, [springValue, decimals])

    return (
        <span ref={ref} className={cn(className)}>
            {prefix}{display}{suffix}
        </span>
    )
}

interface ProgressBarProps {
    value: number
    className?: string
    barClassName?: string
    duration?: number
}

export function AnimatedProgressBar({
    value,
    className,
    barClassName,
    duration = 1.5,
}: ProgressBarProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-60px" })

    return (
        <div ref={ref} className={cn("h-1.5 bg-white/10 rounded-full overflow-hidden", className)}>
            <motion.div
                className={cn("h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full", barClassName)}
                initial={{ width: "0%" }}
                animate={isInView ? { width: `${value}%` } : { width: "0%" }}
                transition={{ duration, ease: [0.25, 0.4, 0.25, 1], delay: 0.3 }}
            />
        </div>
    )
}
