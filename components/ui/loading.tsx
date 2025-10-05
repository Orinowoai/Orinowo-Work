// Loading components for premium UX
import React from 'react'

export const SkeletonCard = () => (
  <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 animate-pulse">
    <div className="w-full h-48 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded-lg mb-4" />
    <div className="h-4 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded w-3/4 mb-2" />
    <div className="h-3 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded w-1/2 mb-4" />
    <div className="flex justify-between items-center">
      <div className="h-3 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded w-1/4" />
      <div className="h-8 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded w-20" />
    </div>
  </div>
)

export const BlogCardSkeleton = () => (
  <article className="bg-white/5 backdrop-blur-md rounded-xl overflow-hidden animate-pulse">
    <div className="relative h-48 bg-gradient-to-r from-gray-300/20 to-gray-400/20" />
    <div className="p-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-3 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded w-16" />
        <div className="h-3 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded w-20" />
      </div>
      <div className="h-6 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded w-4/5 mb-3" />
      <div className="h-4 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded w-full mb-2" />
      <div className="h-4 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded w-3/4 mb-4" />
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded w-24" />
        <div className="h-3 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded w-16" />
      </div>
    </div>
  </article>
)

export const LoadingSpinner = ({ size = 'md', color = 'golden' }: { 
  size?: 'sm' | 'md' | 'lg', 
  color?: 'golden' | 'white' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }
  
  const colorClasses = {
    golden: 'border-yellow-400',
    white: 'border-white'
  }

  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-transparent ${colorClasses[color]} border-t-current`} />
  )
}

export const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
    {children}
  </div>
)

export const ButtonLoading = ({ 
  loading, 
  children, 
  className = "", 
  ...props 
}: {
  loading: boolean
  children: React.ReactNode
  className?: string
  [key: string]: any
}) => (
  <button 
    className={`relative overflow-hidden transition-all duration-200 ${className} ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
    disabled={loading}
    {...props}
  >
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <LoadingSpinner size="sm" color="white" />
      </div>
    )}
    {children}
  </button>
)