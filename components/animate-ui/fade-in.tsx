"use client"

import { motion, useInView, Variants } from "framer-motion"
import { useRef, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FadeInProps {
    children: ReactNode
    className?: string
    delay?: number
    duration?: number
    direction?: "up" | "down" | "left" | "right" | "none"
    distance?: number
    once?: boolean
}

export function FadeIn({
    children,
    className,
    delay = 0,
    duration = 0.6,
    direction = "up",
    distance = 24,
    once = true,
}: FadeInProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once, margin: "-60px" })

    const directionMap = {
        up: { y: distance },
        down: { y: -distance },
        left: { x: distance },
        right: { x: -distance },
        none: {},
    }

    const variants: Variants = {
        hidden: { opacity: 0, ...directionMap[direction] },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
                duration,
                delay,
                ease: [0.25, 0.4, 0.25, 1],
            },
        },
    }

    return (
        <motion.div
            ref={ref}
            variants={variants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className={cn(className)}
        >
            {children}
        </motion.div>
    )
}

interface StaggerContainerProps {
    children: ReactNode
    className?: string
    staggerDelay?: number
    once?: boolean
}

export function StaggerContainer({
    children,
    className,
    staggerDelay = 0.1,
    once = true,
}: StaggerContainerProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once, margin: "-60px" })

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
                delayChildren: 0.1,
            },
        },
    }

    return (
        <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className={cn(className)}
        >
            {children}
        </motion.div>
    )
}

export function StaggerItem({
    children,
    className,
    direction = "up",
    distance = 24,
}: Omit<FadeInProps, "delay" | "once" | "duration">) {
    const variants: Variants = {
        hidden: {
            opacity: 0,
            y: direction === "up" ? distance : direction === "down" ? -distance : 0,
            x: direction === "left" ? distance : direction === "right" ? -distance : 0,
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.4, 0.25, 1],
            },
        },
    }

    return (
        <motion.div variants={variants} className={cn(className)}>
            {children}
        </motion.div>
    )
}
