'use client'

import { useEffect, useRef, useState } from 'react'

type From = 'bottom' | 'left' | 'right' | 'scale' | 'fade'

const CLASS: Record<From, string> = {
    bottom: 'reveal-up',
    left: 'reveal-left',
    right: 'reveal-right',
    scale: 'reveal-scale',
    fade: 'reveal-fade',
}

interface Props {
    children: React.ReactNode
    className?: string
    delay?: number
    from?: From
}

export function AnimateIn({ children, className = '', delay = 0, from = 'bottom' }: Props) {
    const ref = useRef<HTMLDivElement>(null)
    const [on, setOn] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setOn(true)
                    io.disconnect()
                }
            },
            { threshold: 0.08, rootMargin: '0px 0px -36px 0px' },
        )
        io.observe(el)
        return () => io.disconnect()
    }, [])

    return (
        <div
            ref={ref}
            className={`${on ? CLASS[from] : 'opacity-0'} ${className}`}
            style={on && delay ? { animationDelay: `${delay}ms` } : undefined}
        >
            {children}
        </div>
    )
}
