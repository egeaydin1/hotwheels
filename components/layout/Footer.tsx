import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-hw-border bg-hw-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-hw-red font-black text-xl">HW</span>
            <span className="text-white font-bold text-lg">VAULT</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/catalog" className="hover:text-white transition-colors">Catalog</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
            <a href="https://github.com" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} HW Vault. Not affiliated with Mattel.
          </p>
        </div>
      </div>
    </footer>
  )
}
