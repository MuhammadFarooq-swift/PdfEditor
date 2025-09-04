'use client'
import Link from 'next/link'
import { Menu, X, Github } from 'lucide-react'
import Logo from './logo'
import { useEffect, useState } from 'react'
import { MobileNav } from './sidebar'
import { setMenu, useMenu } from './stores/menu'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const menu = useMenu()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Add effect to handle body scroll locking
  useEffect(() => {
    if (menu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [menu])

  return (
    <>
      <header
        className={`nextra-navbar sticky top-0 z-20 w-full transition-all duration-300 ${scrolled && !menu ? 'bg-white/90 shadow-md backdrop-blur-md' : 'bg-transparent'}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative h-16 w-16">
                <Logo />
              </div>
              <span className="text-xl font-bold">EmbedPDF</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-6 md:flex">
              {/* <a href="#features" className="group text-gray-600 transition-colors relative py-2">
              <span className="relative z-10">Features</span>
              <span className="absolute inset-0 bg-purple-100 rounded-full scale-0 group-hover:scale-100 transition-transform"></span>
            </a> */}
              <Link
                href="/docs"
                className="group relative px-4 py-2 text-gray-600 transition-colors"
              >
                <span className="relative z-10">Documentation</span>
                <span className="absolute inset-0 scale-0 rounded-full bg-blue-100 transition-transform group-hover:scale-100"></span>
              </Link>
              <Link
                href="/tools"
                className="group relative px-4 py-2 text-gray-600 transition-colors"
              >
                <span className="relative z-10">Tools</span>
                <span className="absolute inset-0 scale-0 rounded-full bg-orange-100 transition-transform group-hover:scale-100"></span>
              </Link>
              {/* <Link href="/blog" className="group text-gray-600 transition-colors relative py-2 px-4">
              <span className="relative z-10">Blog</span>
              <span className="absolute inset-0 bg-orange-100 rounded-full scale-0 group-hover:scale-100 transition-transform"></span>
            </Link> */}
              {/* <a href="#examples" className="group text-gray-600 transition-colors relative py-2">
              <span className="relative z-10">Examples</span>
              <span className="absolute inset-0 bg-orange-100 rounded-full scale-0 group-hover:scale-100 transition-transform"></span>
            </a> */}
              {/* <a href="#community" className="group text-gray-600 transition-colors relative py-2">
              <span className="relative z-10">Community</span>
              <span className="absolute inset-0 bg-red-100 rounded-full scale-0 group-hover:scale-100 transition-transform"></span>
            </a> */}
              <a
                href="https://github.com/embedpdf/embed-pdf-viewer"
                className="group relative inline-flex items-center space-x-2 overflow-hidden rounded-full bg-gray-900 px-5 py-2 text-white"
                target="_blank"
                rel="noreferrer"
              >
                <span className="absolute left-0 top-0 h-full w-full bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100"></span>
                <Github className="z-10 h-4 w-4" />
                <span className="relative z-10 text-sm font-medium">
                  GitHub
                </span>
              </a>
            </nav>

            {/* Mobile menu button */}
            <button
              className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg transition-all hover:text-purple-600 md:hidden"
              onClick={() => {
                setMenu(!menu)
              }}
            >
              {menu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Modified Mobile Navigation */}
        {menu && (
          <div className="fixed inset-0 md:hidden">
            <div className="absolute right-0 top-[4.5rem] w-full">
              <div className="mx-4 max-h-[calc(100vh-10rem)] overflow-y-auto rounded-lg border border-gray-100 bg-white/95 shadow-lg backdrop-blur-lg">
                <div className="space-y-1 py-2">
                  {/*<a 
                  href="#features" 
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 flex items-center space-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                  <span>Features</span>
                </a>*/}
                  <Link
                    href="/docs"
                    className="block flex items-center space-x-2 px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setMenu(false)}
                  >
                    <div className="h-6 w-1 rounded-full bg-blue-500"></div>
                    <span>Documentation</span>
                  </Link>
                  <div className="px-4 pb-3">
                    <MobileNav route="/docs" />
                  </div>
                  <Link
                    href="/tools"
                    className="block flex items-center space-x-2 px-4 py-3 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    onClick={() => setMenu(false)}
                  >
                    <div className="h-6 w-1 rounded-full bg-orange-400"></div>
                    <span>Tools</span>
                  </Link>
                  {/*<a 
                  href="#examples" 
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50 flex items-center space-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-1 h-6 bg-orange-400 rounded-full"></div>
                  <span>Examples</span>
                </a>*/}
                  {/*<a 
                  href="#community" 
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-red-500 hover:bg-red-50 flex items-center space-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                  <span>Community</span>
                </a>*/}
                  <a
                    href="https://github.com/embedpdf/embed-pdf-viewer"
                    className="mx-4 my-3 flex items-center justify-center space-x-2 rounded-lg bg-gray-900 px-4 py-2 text-white"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMenu(false)}
                  >
                    <Github />
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
      {menu && (
        <div className="fixed inset-0 z-10 bg-black/20 backdrop-blur-sm md:hidden"></div>
      )}
    </>
  )
}
