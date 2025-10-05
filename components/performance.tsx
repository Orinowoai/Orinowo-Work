// Performance monitoring and optimization utilities
'use client'

import { useEffect } from 'react'

export function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
        onCLS(console.log)
        onFCP(console.log)
        onLCP(console.log)
        onTTFB(console.log)
        // INP replaces FID in newer specs
        if (onINP) onINP(console.log as any)
      })
    }

    // Monitor navigation timing
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (perfData) {
          console.log('Performance Metrics:', {
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            responseTime: perfData.responseEnd - perfData.requestStart,
            domInteractive: perfData.domInteractive - perfData.domContentLoadedEventStart
          })
        }
      })
    }
  }, [])

  return null
}

// Optimize heavy components with dynamic imports
export const DynamicComponent = ({ children }: { children: React.ReactNode }) => {
  return <div className="will-change-transform">{children}</div>
}

// Image optimization helper
export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = "", 
  priority = false,
  ...props 
}: {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  [key: string]: any
}) {
  const blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`transition-opacity duration-300 ${className}`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      {...(width && height && { 
        style: { aspectRatio: `${width}/${height}` }
      })}
      {...props}
    />
  )
}