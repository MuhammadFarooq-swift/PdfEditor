import React from 'react'
import { Github } from 'lucide-react'
import DiscordIcon from './icons/discord'

export const NeedHelp: React.FC = () => {
  return (
    <div className="relative mb-16 overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
      <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/3 translate-x-1/3 transform rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>

      <div className="relative flex flex-col gap-8 md:flex-row md:items-center">
        <div className="md:flex-1">
          <h2 className="mb-4 text-2xl font-bold">Need Help?</h2>
          <p className="mb-6 text-gray-600">
            Join our community for support, discussions, and to contribute to
            EmbedPDF&apos;s development.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com/embedpdf/embed-pdf-viewer/issues"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 rounded-full bg-gray-900 px-5 py-2 font-medium text-white transition-colors hover:bg-gray-800"
            >
              <Github className="h-4 w-4" />
              <span>GitHub Discussions</span>
            </a>
            <a
              href="https://discord.gg/mHHABmmuVU"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 rounded-full bg-indigo-600 px-5 py-2 font-medium text-white transition-colors hover:bg-indigo-700"
            >
              <DiscordIcon size={22} strokeColor="white" />
              <span>Discord Community</span>
            </a>
          </div>
        </div>

        {/*<div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="font-medium mb-3">Popular Questions</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/docs/faq#custom-rendering" className="text-blue-600 hover:text-blue-800">
                How to implement custom rendering?
              </Link>
            </li>
            <li>
              <Link href="/docs/faq#file-formats" className="text-blue-600 hover:text-blue-800">
                What file formats are supported?
              </Link>
            </li>
            <li>
              <Link href="/docs/faq#performance" className="text-blue-600 hover:text-blue-800">
                Tips for optimizing performance
              </Link>
            </li>
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              href="/docs/faq"
              className="text-blue-700 font-medium hover:text-blue-900 flex items-center"
            >
              View all FAQs
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>*/}
      </div>
    </div>
  )
}

export default NeedHelp
