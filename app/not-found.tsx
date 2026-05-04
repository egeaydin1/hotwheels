import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-hw-dark flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl font-black text-hw-red mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-gray-400 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="btn-primary px-8 py-3">
          Go Home
        </Link>
      </div>
    </div>
  )
}
