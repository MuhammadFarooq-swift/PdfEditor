import React from 'react'
import { ArrowRight, Calendar } from 'lucide-react'
import Link from 'next/link'
import type { MdxFile } from 'nextra'
import { getPageMap } from 'nextra/page-map'

// Define proper types
interface BlogPost {
  id: string
  title: string
  excerpt: string
  date: string
  route: string
}

interface PostProps {
  post: BlogPost
}

// Blog post card component
const BlogPostCard = ({ post }: PostProps) => {
  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 blur transition duration-300 group-hover:opacity-25"></div>
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md">
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex items-center text-sm text-gray-500">
            <Calendar size={14} className="mr-1" />
            <span>{post.date}</span>
          </div>

          <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-purple-700">
            {post.title}
          </h3>

          <p className="mb-4 text-gray-600">{post.excerpt}</p>
          <div className="flex-1"></div>
          <div className="mt-auto">
            <Link
              href={post.route}
              className="inline-flex items-center font-medium text-purple-700 transition-colors group-hover:text-purple-900"
            >
              Read more
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Featured post component
const FeaturedPost = ({ post }: PostProps) => {
  return (
    <div className="relative mb-16 overflow-hidden rounded-2xl shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-blue-900/90"></div>
      <div className="relative z-10 max-w-3xl p-8 text-white md:p-12">
        <h2 className="mb-4 text-3xl font-bold md:text-4xl">{post.title}</h2>

        <p className="mb-6 text-lg text-gray-200 md:text-xl">{post.excerpt}</p>

        <div className="mb-6 flex items-center text-gray-300">
          <Calendar size={16} className="mr-1" />
          <span>{post.date}</span>
        </div>

        <Link
          href={post.route}
          className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-medium text-purple-800 shadow-lg transition-colors hover:bg-gray-100"
        >
          Read Featured Post
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  )
}

// Animated blobs for the background
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 -z-10">
      {/* Purple blob */}
      <div className="top-70 animate-blob absolute left-8 h-64 w-64 rounded-full bg-purple-500 opacity-10 mix-blend-multiply blur-3xl filter"></div>

      {/* Blue blob */}
      <div className="animate-blob animation-delay-2000 absolute -right-8 top-32 h-80 w-80 rounded-full bg-blue-500 opacity-10 mix-blend-multiply blur-3xl filter"></div>

      {/* Orange blob */}
      <div className="animate-blob animation-delay-4000 absolute bottom-24 left-20 h-72 w-72 rounded-full bg-orange-400 opacity-10 mix-blend-multiply blur-3xl filter"></div>

      {/* Subtle grid pattern */}
      <div className="bg-grid-pattern absolute inset-0 opacity-5"></div>
    </div>
  )
}

const BlogOverview = async () => {
  // Fetch real blog posts from MDX files
  const pageMap = (await getPageMap(`/blog`)) as unknown as MdxFile[]

  // Transform MDX files into blog post format
  const blogPosts: BlogPost[] = pageMap
    .filter((page) => page.name !== 'index')
    .map((page) => {
      const { title, description, timestamp } = page.frontMatter || {}

      const date = timestamp
        ? new Date(timestamp).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        : 'No date'

      return {
        id: page.route,
        title: title || 'Untitled',
        excerpt: description || 'No description available',
        date,
        route: page.route,
      }
    })

  // Get the first post as featured (if available)
  const featuredPost = blogPosts.length > 0 ? blogPosts[0] : null

  // Remove featured post from regular listing
  const regularPosts = featuredPost
    ? blogPosts.filter((post) => post.id !== featuredPost.id)
    : blogPosts

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="pb-16 pt-20 sm:pt-24 lg:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Blog Header */}
          <div className="mb-16 text-center">
            <div className="mb-6 inline-block rounded-full border border-purple-200 bg-purple-50 px-6 py-2 text-sm font-medium text-purple-800">
              Our Blog
            </div>
            <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-gray-900 md:text-5xl">
              Latest News & Insights
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Tips, tutorials, and updates from the EmbedPDF team to help you
              build better PDF experiences.
            </p>
          </div>

          {/* Featured Post */}
          {featuredPost && <FeaturedPost post={featuredPost} />}

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {regularPosts.length > 0 ? (
              regularPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="col-span-3 py-12 text-center">
                <div className="text-2xl font-bold text-gray-400">
                  No posts found
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogOverview
