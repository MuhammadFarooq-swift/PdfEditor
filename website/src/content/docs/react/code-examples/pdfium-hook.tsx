'use client'

import { usePdfiumEngine } from '@embedpdf/engines/react'
import { ignore } from '@embedpdf/models'
import { useEffect, useState } from 'react'

export default function LoadingPDFiumExample() {
  const { isLoading, error, engine } = usePdfiumEngine()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (engine && !initialized) {
      if (engine.initialize) {
        const task = engine.initialize()
        task.wait(setInitialized, ignore)
      } else {
        setInitialized(true)
      }
    }
  }, [engine, initialized])

  if (error) {
    return (
      <div className="mt-3 rounded-md bg-red-50 p-4 text-sm font-medium text-red-800">
        Failed to initialize PDF engine: {error.message}
      </div>
    )
  }

  if (isLoading || !engine || !initialized) {
    return (
      <div className="mt-3 rounded-md bg-yellow-50 p-4 text-sm font-medium text-yellow-800">
        Loading PDF engine...
      </div>
    )
  }

  // Engine is ready to use
  return (
    <div className="mt-3 rounded-md bg-green-50 p-4 text-sm font-medium text-green-800">
      Engine loaded successfully!
    </div>
  )
}
