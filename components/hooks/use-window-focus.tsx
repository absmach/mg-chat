"use client"

import { useEffect, useState } from "react"

export function useWindowFocus() {
    const [isWindowFocused, setIsWindowFocused] = useState(true)

    useEffect(() => {
        const handleFocus = () => setIsWindowFocused(true)
        const handleBlur = () => setIsWindowFocused(false)

        window.addEventListener("focus", handleFocus)
        window.addEventListener("blur", handleBlur)

        return () => {
            window.removeEventListener("focus", handleFocus)
            window.removeEventListener("blur", handleBlur)
        }
    }, [])

    return isWindowFocused
}
