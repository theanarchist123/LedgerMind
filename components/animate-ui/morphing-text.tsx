"use client"

import { motion, Variants } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { cn } from "@/lib/utils"

interface SplitTextProps {
    text: string
    className?: string
    delay?: number
    once?: boolean
    type?: "words" | "chars"
}

export function SplitText({
    text,
    className,
    delay = 0,
    once = true,
    type = "words",
}: SplitTextProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once, margin: "-40px" })
    const tokens = type === "chars" ? text.split("") : text.split(" ")

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: type === "chars" ? 0.03 : 0.07,
                delayChildren: delay,
            },
        },
    }

    const wordVariants: Variants = {
        hidden: { opacity: 0, y: 30, rotateX: -40, filter: "blur(4px)" },
        visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            filter: "blur(0px)",
            transition: {
                duration: 0.7,
                ease: [0.25, 0.4, 0.25, 1],
            },
        },
    }

    return (
        <motion.span
            ref={ref}
            className={cn("inline-block overflow-hidden", className)}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            style={{ perspective: "1000px" }}
        >
            {tokens.map((token, index) => (
                <motion.span
                    key={index}
                    variants={wordVariants}
                    className="inline-block will-change-transform"
                    style={{ transformOrigin: "bottom center" }}
                >
                    {token}
                    {type === "words" && index < tokens.length - 1 ? "\u00a0" : ""}
                </motion.span>
            ))}
        </motion.span>
    )
}

interface GlitchTextProps {
    text: string
    className?: string
}

export function GlitchText({ text, className }: GlitchTextProps) {
    return (
        <span className={cn("relative inline-block group", className)}>
            <span className="relative z-10">{text}</span>
            <span
                className="absolute inset-0 text-emerald-400 opacity-0 group-hover:opacity-70 transition-opacity duration-100"
                style={{ transform: "translate(2px, -2px)", clipPath: "polygon(0 30%, 100% 30%, 100% 50%, 0 50%)" }}
                aria-hidden
            >
                {text}
            </span>
            <span
                className="absolute inset-0 text-amber-400 opacity-0 group-hover:opacity-70 transition-opacity duration-100"
                style={{ transform: "translate(-2px, 2px)", clipPath: "polygon(0 60%, 100% 60%, 100% 80%, 0 80%)" }}
                aria-hidden
            >
                {text}
            </span>
        </span>
    )
}
