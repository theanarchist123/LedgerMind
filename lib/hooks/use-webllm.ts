'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

export interface UseWebLLMReturn {
  isLoading: boolean
  error: string | null
  ready: boolean
  chat: (messages: Array<{ role: string; content: string }>, temperature?: number, maxTokens?: number) => Promise<string>
  progress: number
  modelName: string
}

// TinyLlama is 3x smaller and much faster to load (~300MB vs 1.5GB)
const MODEL_NAME = 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC'

export function useWebLLM(): UseWebLLMReturn {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const engineRef = useRef<any>(null)
  const initializingRef = useRef(false)

  // Initialize WebLLM on mount
  useEffect(() => {
    if (initializingRef.current) return
    
    let cancelled = false

    const initWebLLM = async () => {
      try {
        initializingRef.current = true
        setIsLoading(true)
        setError(null)
        setProgress(0)
        setReady(false)

        // Lazy load WebLLM
        const webllm = await import('@mlc-ai/web-llm')
        const { CreateMLCEngine } = webllm as any

        // Create engine with progress tracking
        const progressCallback = (p: any) => {
          const pct = typeof p?.progress === 'number'
            ? Math.max(0, Math.min(100, Math.round(p.progress * 100)))
            : 0
          if (!cancelled) setProgress(pct)
        }

        console.log(`[WebLLM] Creating engine with model: ${MODEL_NAME}`)
        
        // Create engine with model loaded automatically
        const engine = await CreateMLCEngine({
          modelId: MODEL_NAME,
          initProgressCallback: progressCallback,
        })

        if (cancelled) return

        // Ensure model is loaded
        console.log(`[WebLLM] Reloading model: ${MODEL_NAME}`)
        await engine.reload(MODEL_NAME)

        if (cancelled) return

        engineRef.current = engine
        setProgress(100)
        setReady(true)
        setIsLoading(false)
        console.log(`[WebLLM] Model loaded successfully: ${MODEL_NAME}`)
      } catch (err: any) {
        if (!cancelled) {
          const errorMsg = err?.message || 'Failed to initialize WebLLM'
          console.error('[WebLLM] Initialization error:', err)
          setError(errorMsg)
          setReady(false)
          setIsLoading(false)
        }
      }
    }

    initWebLLM()

    // Cleanup on unmount
    return () => {
      cancelled = true
      if (engineRef.current) {
        try {
          engineRef.current = null
        } catch (e) {
          console.error('[WebLLM] Cleanup error:', e)
        }
      }
    }
  }, [])

  // Chat function
  const chat = useCallback(
    async (
      messages: Array<{ role: string; content: string }>,
      temperature: number = 0.7,
      maxTokens: number = 512
    ): Promise<string> => {
      if (!engineRef.current || !ready) {
        throw new Error('WebLLM engine not ready. Please wait for model to load.')
      }

      try {
        const response = await engineRef.current.chat.completions.create({
          messages,
          temperature,
          max_tokens: maxTokens,
        })

        const content = response?.choices?.[0]?.message?.content || ''
        return content.trim()
      } catch (err: any) {
        console.error('[WebLLM] Chat error:', err)
        throw err
      }
    },
    [ready]
  )

  return {
    isLoading,
    error,
    ready,
    chat,
    progress,
    modelName: MODEL_NAME,
  }
}
