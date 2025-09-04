'use client'
import React, { useState } from 'react'
import {
  ArrowRight,
  Code,
  Heart,
  Users,
  Zap,
  Target,
  GitBranch,
  Star,
  Download,
  Eye,
  Edit,
  MousePointer2,
  Paintbrush,
  Minus,
  Square,
  Circle,
  PenTool,
  Underline,
  Highlighter,
  Github,
  ExternalLink,
  CheckCircle,
  Clock,
  Sparkles,
  Rocket,
  EyeOff,
  Type,
  MessageCircle,
  FileText,
  Badge,
  FileSignature,
  Paperclip,
} from 'lucide-react'
import Link from 'next/link'
import PDFViewer from './pdf-viewer'
import DiscordIcon from './icons/discord'

// Animated background
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 -z-10">
      {/* Large gradient orbs */}
      <div className="animate-blob absolute -left-20 top-10 h-96 w-96 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-15 mix-blend-multiply blur-3xl filter"></div>
      <div className="animate-blob animation-delay-2000 absolute -right-20 top-40 h-80 w-80 rounded-full bg-gradient-to-r from-red-500 to-cyan-500 opacity-15 mix-blend-multiply blur-3xl filter"></div>
      <div className="animate-blob animation-delay-4000 absolute bottom-20 left-1/2 h-72 w-72 rounded-full bg-gradient-to-r from-orange-400 to-red-500 opacity-15 mix-blend-multiply blur-3xl filter"></div>

      {/* Subtle grid */}
      <div className="bg-grid-pattern absolute inset-0 opacity-5"></div>
    </div>
  )
}

// Feature card component
const FeatureCard = ({
  icon,
  title,
  description,
  status,
  gradient,
}: {
  icon: React.ReactNode
  title: string
  description: string
  status: 'available' | 'coming-soon'
  gradient: string
}) => {
  return (
    <div className="group relative h-full">
      <div
        className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${gradient} opacity-20 blur transition duration-300 group-hover:opacity-40`}
      ></div>
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-transform group-hover:scale-105">
        <div className="mb-4 flex items-center justify-between">
          <div
            className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}
          >
            {icon}
          </div>
          <div
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              status === 'available'
                ? 'bg-green-100 text-green-800'
                : 'bg-orange-100 text-orange-800'
            }`}
          >
            {status === 'available' ? '✓ Available' : '⏳ Coming Soon'}
          </div>
        </div>
        <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
        <p className="flex-grow text-gray-600">{description}</p>
      </div>
    </div>
  )
}

// Stats component
const StatsSection = () => {
  return (
    <div className="relative mb-20">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white shadow-2xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/10">
            {/* Background effects */}
            <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/3 translate-x-1/3 transform rounded-full bg-gradient-to-br from-cyan-400 to-red-500 opacity-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/3 translate-y-1/3 transform rounded-full bg-gradient-to-br from-purple-400 to-pink-500 opacity-20 blur-3xl"></div>

            <div className="relative z-10 p-8 md:p-12">
              <div className="mb-8 text-center">
                <h2 className="mb-4 text-3xl font-black md:text-4xl">
                  <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                    Join the Revolution
                  </span>
                </h2>
                <p className="text-xl text-slate-300">
                  Be part of building the world&apos;s most powerful open source
                  PDF editor
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="text-center">
                  <div className="mb-2 text-4xl font-black text-cyan-400">
                    8+
                  </div>
                  <div className="text-slate-300">Annotation Types</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-4xl font-black text-purple-400">
                    MIT
                  </div>
                  <div className="text-slate-300">Licensed</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-4xl font-black text-pink-400">
                    ∞
                  </div>
                  <div className="text-slate-300">Possibilities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Editor() {
  const [activeDemo, setActiveDemo] = useState('highlight')

  const availableFeatures = [
    {
      icon: <Highlighter className="h-6 w-6 text-white" />,
      title: 'Text Highlighting',
      description:
        'Mark important text with colorful highlights for better document organization.',
      status: 'available' as const,
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: <Underline className="h-6 w-6 text-white" />,
      title: 'Text Underline',
      description:
        'Emphasize text with clean underlines in various colors and styles.',
      status: 'available' as const,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <PenTool className="h-6 w-6 text-white" />,
      title: 'Ink Annotations',
      description: 'Draw freehand annotations with natural pen-like strokes.',
      status: 'available' as const,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Minus className="h-6 w-6 text-white" />,
      title: 'Strikeout Text',
      description:
        'Cross out text with professional strikethrough annotations.',
      status: 'available' as const,
      gradient: 'from-red-500 to-pink-500',
    },
    {
      icon: <MousePointer2 className="h-6 w-6 text-white" />,
      title: 'Squiggly Lines',
      description: 'Add wavy underlines to indicate errors or suggestions.',
      status: 'available' as const,
      gradient: 'from-green-500 to-teal-500',
    },
    {
      icon: <Circle className="h-6 w-6 text-white" />,
      title: 'Circle Annotations',
      description:
        'Draw circles to highlight specific areas or call attention to content.',
      status: 'available' as const,
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: <Square className="h-6 w-6 text-white" />,
      title: 'Rectangle Annotations',
      description:
        'Create rectangular shapes for structured highlighting and emphasis.',
      status: 'available' as const,
      gradient: 'from-teal-500 to-green-500',
    },
    {
      icon: <Minus className="h-6 w-6 rotate-90 text-white" />,
      title: 'Line Annotations',
      description:
        'Draw straight lines for connecting ideas and creating visual relationships.',
      status: 'available' as const,
      gradient: 'from-orange-500 to-red-500',
    },
  ]

  const upcomingFeatures = [
    {
      icon: <FileText className="h-6 w-6 text-white" />,
      title: 'Free Text Annotation',
      description:
        'Add floating text boxes anywhere on the document with custom fonts and styling.',
      status: 'coming-soon' as const,
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      icon: <Badge className="h-6 w-6 text-white" />,
      title: 'Stamp Annotation',
      description:
        'Apply pre-designed stamps like "Approved", "Confidential", or create custom stamps.',
      status: 'coming-soon' as const,
      gradient: 'from-purple-500 to-violet-500',
    },
    {
      icon: <FileSignature className="h-6 w-6 text-white" />,
      title: 'Signature Annotation',
      description:
        'Add digital signatures with drawing, typing, or uploading signature images.',
      status: 'coming-soon' as const,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Paperclip className="h-6 w-6 text-white" />,
      title: 'File Attachment',
      description:
        'Attach files, images, or documents directly to specific locations in the PDF.',
      status: 'coming-soon' as const,
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      icon: <EyeOff className="h-6 w-6 text-white" />,
      title: 'Text Redaction',
      description:
        'Permanently remove sensitive information with secure black-out blocks.',
      status: 'coming-soon' as const,
      gradient: 'from-gray-600 to-black',
    },
    {
      icon: <Type className="h-6 w-6 text-white" />,
      title: 'Inline Text Editing',
      description:
        'Edit text directly in the PDF with full formatting and font support.',
      status: 'coming-soon' as const,
      gradient: 'from-emerald-500 to-blue-500',
    },
  ]

  return (
    <div className="relative min-h-screen">
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(20px, -20px) scale(1.1);
          }
          66% {
            transform: translate(-15px, 15px) scale(0.95);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 12s infinite alternate;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .bg-grid-pattern {
          background-image:
            linear-gradient(
              to right,
              rgba(24, 24, 100, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(24, 24, 100, 0.05) 1px,
              transparent 1px
            );
          background-size: 32px 32px;
        }
      `}</style>

      <AnimatedBackground />

      <div className="pb-16 pt-20 sm:pt-24 lg:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="relative mb-24 text-center">
            <div className="mb-8 inline-block rounded-full border border-purple-200 bg-purple-50 px-6 py-3 text-sm font-bold text-purple-800">
              🚀 Open Source • MIT Licensed • Community Driven
            </div>

            <h1 className="mb-8 text-5xl font-black leading-tight tracking-tight text-gray-900 md:text-6xl">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 bg-clip-text text-transparent">
                The Future of
              </span>
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">PDF Editing</span>
                <div className="absolute bottom-2 left-0 right-0 -z-10 h-6 -rotate-1 transform bg-gradient-to-r from-yellow-400 to-orange-400 opacity-30"></div>
              </span>
              <br />
              <span className="text-gray-900">is Open Source</span>
            </h1>

            <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-gray-600">
              We&apos;re building the world&apos;s most powerful open source PDF
              editor. Join thousands of developers who believe PDF editing
              should be free, customizable, and owned by the community.
            </p>

            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
              <a
                href="https://app.embedpdf.com"
                target="_blank"
                rel="noreferrer"
                className="hover:shadow-3xl group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-purple-600 via-blue-500 to-teal-500 px-10 py-5 text-lg font-bold text-white shadow-2xl transition-all hover:scale-105"
              >
                <span className="absolute left-0 top-0 h-full w-full bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 opacity-0 transition-opacity group-hover:opacity-100"></span>
                <span className="relative z-10 flex items-center">
                  <Edit className="mr-3 h-6 w-6" />
                  Try the Editor
                  <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
                </span>
              </a>

              <a
                href="https://github.com/embedpdf/embed-pdf-viewer"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center justify-center rounded-full border-2 border-gray-800 bg-transparent px-10 py-5 text-lg font-bold text-gray-800 transition-all hover:scale-105 hover:bg-gray-800 hover:text-white"
              >
                <Github className="mr-3 h-6 w-6" />
                <span>Star on GitHub</span>
                <Star className="ml-3 h-5 w-5 transition-transform group-hover:scale-110" />
              </a>
            </div>
          </div>

          {/* Live Demo Section */}
          <div className="relative mb-24">
            <div className="mb-12 text-center">
              <h2 className="mb-6 text-4xl font-black text-gray-900 md:text-5xl">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Experience the Magic
                </span>
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-gray-600">
                See our annotation features in action. This is just the
                beginning of what&apos;s possible.
              </p>
            </div>

            {/* PDF Demo Container */}
            <div className="group relative mx-auto max-w-5xl">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600 via-blue-500 to-teal-500 opacity-30 blur transition duration-500 group-hover:opacity-50"></div>
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="h-[600px] w-full md:h-[700px]">
                  <PDFViewer className="h-full w-full" />
                </div>
              </div>
            </div>

            {/* Annotation Features Showcase */}
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              {[
                'Highlight',
                'Underline',
                'Strikeout',
                'Squiggly',
                'Ink Drawing',
                'Circle',
                'Rectangle',
                'Line',
              ].map((feature, index) => (
                <div key={feature} className="group relative">
                  <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-30 blur transition duration-300 group-hover:opacity-60"></div>
                  <div className="relative rounded-full bg-white px-6 py-3 shadow-lg">
                    <span className="font-medium text-gray-800">
                      ✨ {feature}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Features */}
          <div className="mb-24">
            <div className="mb-12 text-center">
              <h2 className="mb-6 text-4xl font-black text-gray-900 md:text-5xl">
                Available Right Now
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-gray-600">
                These powerful annotation features are ready to use today
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {availableFeatures.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <StatsSection />

          {/* Upcoming Features */}
          <div className="mb-24">
            <div className="mb-12 text-center">
              <h2 className="mb-6 text-4xl font-black text-gray-900 md:text-5xl">
                Coming Very Soon
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-gray-600">
                The next wave of features we&apos;re actively developing
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {upcomingFeatures.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>

          {/* Vision Section */}
          <div className="relative mb-24 overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white">
            {/* Background effects */}
            <div className="absolute right-0 top-0 h-80 w-80 -translate-y-1/2 translate-x-1/2 transform rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 opacity-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 transform rounded-full bg-gradient-to-br from-purple-400 to-pink-500 opacity-20 blur-3xl"></div>

            <div className="relative z-10 p-12 md:p-20">
              <div className="mx-auto max-w-4xl text-center">
                <div className="mb-8 inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-6 py-3 text-sm font-bold text-slate-300 backdrop-blur-sm">
                  🎯 Our Mission
                </div>

                <h2 className="mb-8 text-4xl font-black leading-tight md:text-6xl">
                  <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                    Become the #1
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-red-300 bg-clip-text text-transparent">
                    Open Source PDF Editor
                  </span>
                </h2>

                <p className="mb-12 text-xl leading-relaxed text-gray-300">
                  We&apos;re not just building another PDF editor. We&apos;re
                  creating a movement. A world where powerful document editing
                  belongs to everyone, not locked behind expensive licenses.
                  Join us in making PDF editing free, powerful, and accessible
                  to all.
                </p>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                  <div className="text-center">
                    <div className="mb-4 inline-block rounded-full bg-cyan-500/20 p-4">
                      <Heart className="h-8 w-8 text-cyan-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold">Community First</h3>
                    <p className="text-gray-400">
                      Built by developers, for developers
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mb-4 inline-block rounded-full bg-purple-500/20 p-4">
                      <Code className="h-8 w-8 text-purple-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold">Always Free</h3>
                    <p className="text-gray-400">
                      MIT licensed, no strings attached
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mb-4 inline-block rounded-full bg-pink-500/20 p-4">
                      <Rocket className="h-8 w-8 text-pink-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold">Blazing Fast</h3>
                    <p className="text-gray-400">
                      Performance that puts others to shame
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contribution Call-to-Action */}
          <div className="relative mb-24">
            <div className="mx-auto max-w-5xl text-center">
              <div className="mb-8 inline-block rounded-full border border-green-200 bg-green-50 px-6 py-3 text-sm font-bold text-green-800">
                🤝 Join Our Community
              </div>

              <h2 className="mb-6 text-4xl font-black text-gray-900 md:text-5xl">
                Help Us Build the Future
              </h2>

              <p className="mb-12 text-xl text-gray-600">
                Whether you&apos;re a developer, designer, or just passionate
                about open source, there&apos;s a place for you in our
                community. Let&apos;s build something amazing together!
              </p>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
                <div className="group rounded-2xl bg-white p-6 shadow-lg transition-transform hover:scale-105">
                  <div className="mb-4 inline-block rounded-full bg-blue-100 p-3">
                    <Code className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mb-2 font-bold">Contribute Code</h3>
                  <p className="text-sm text-gray-600">
                    Help us build new features and fix bugs
                  </p>
                </div>

                <div className="group rounded-2xl bg-white p-6 shadow-lg transition-transform hover:scale-105">
                  <div className="mb-4 inline-block rounded-full bg-purple-100 p-3">
                    <Paintbrush className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="mb-2 font-bold">Design & UX</h3>
                  <p className="text-sm text-gray-600">
                    Make our editor beautiful and intuitive
                  </p>
                </div>

                <div className="group rounded-2xl bg-white p-6 shadow-lg transition-transform hover:scale-105">
                  <div className="mb-4 inline-block rounded-full bg-green-100 p-3">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="mb-2 font-bold">Community</h3>
                  <p className="text-sm text-gray-600">
                    Help others and spread the word
                  </p>
                </div>

                <div className="group rounded-2xl bg-white p-6 shadow-lg transition-transform hover:scale-105">
                  <div className="mb-4 inline-block rounded-full bg-orange-100 p-3">
                    <Target className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="mb-2 font-bold">Testing</h3>
                  <p className="text-sm text-gray-600">
                    Find bugs and suggest improvements
                  </p>
                </div>

                <div className="group rounded-2xl bg-white p-6 shadow-lg transition-transform hover:scale-105">
                  <div className="mb-4 inline-block rounded-full bg-indigo-100 p-3">
                    <DiscordIcon
                      size={24}
                      strokeColor="#4f39f6"
                      className="text-indigo-600"
                    />
                  </div>
                  <h3 className="mb-2 font-bold text-indigo-600">
                    Discord Chat
                  </h3>
                  <p className="text-sm text-gray-600">
                    Join our community discussions
                  </p>
                </div>
              </div>

              <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="https://github.com/embedpdf/embed-pdf-viewer"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-teal-600 px-8 py-4 font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                >
                  <Github className="mr-3 h-5 w-5" />
                  View on GitHub
                  <ExternalLink className="ml-3 h-4 w-4" />
                </a>

                <a
                  href="https://discord.gg/mHHABmmuVU"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                >
                  <DiscordIcon
                    size={20}
                    strokeColor="white"
                    className="mr-3 text-white"
                  />
                  Join Discord
                  <ExternalLink className="ml-3 h-4 w-4" />
                </a>

                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center rounded-full border-2 border-gray-800 px-8 py-4 font-bold text-gray-800 transition-all hover:scale-105 hover:bg-gray-800 hover:text-white"
                >
                  Read Documentation
                  <ArrowRight className="ml-3 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
