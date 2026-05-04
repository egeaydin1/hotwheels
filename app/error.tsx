'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-hw-dark flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-gray-400 mb-8 text-sm">{error.message ?? 'An unexpected error occurred'}</p>
        <button onClick={reset} className="btn-primary px-8 py-3">
          Try Again
        </button>
      </div>
    </div>
  )
}
