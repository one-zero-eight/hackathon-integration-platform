'use client'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'
import { createNoise3D } from 'simplex-noise'

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = 'fast',
  waveOpacity = 0.5,
  ...props
}: {
  children?: any
  className?: string
  containerClassName?: string
  colors?: string[]
  waveWidth?: number
  backgroundFill?: string
  blur?: number
  speed?: 'slow' | 'fast'
  waveOpacity?: number
  [key: string]: any
}) => {
  const noise = createNoise3D()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSafari, setIsSafari] = useState(false)

  const getSpeed = () => {
    switch (speed) {
      case 'slow':
        return 0.001
      case 'fast':
        return 0.002
      default:
        return 0.001
    }
  }

  const waveColors = colors ?? ['#38bdf8', '#818cf8', '#c084fc', '#e879f9', '#22d3ee']

  let w: number, h: number, nt: number, i: number, x: number, ctx: any, canvas: any

  const init = () => {
    canvas = canvasRef.current
    ctx = canvas.getContext('2d')
    w = ctx.canvas.width = window.innerWidth
    h = ctx.canvas.height = window.innerHeight
    ctx.filter = `blur(${blur}px)`
    nt = 0
    render()
  }

  const drawWave = (n: number) => {
    nt += getSpeed()
    for (i = 0; i < n; i++) {
      ctx.beginPath()
      ctx.lineWidth = waveWidth || 50
      ctx.strokeStyle = waveColors[i % waveColors.length]
      for (x = 0; x < w; x += 5) {
        var y = noise(x / 800, 0.3 * i, nt) * 150
        ctx.lineTo(x, y + h * 0.5) // Adjust for height (50% of container height)
      }
      ctx.stroke()
      ctx.closePath()
    }
  }

  let animationId: number
  const render = () => {
    ctx.fillStyle = backgroundFill || 'black'
    ctx.globalAlpha = waveOpacity || 0.5
    ctx.fillRect(0, 0, w, h) // Fill the canvas with background
    drawWave(5)
    animationId = requestAnimationFrame(render) // Keep redrawing
  }

  useEffect(() => {
    init()

    const handleResize = () => {
      if (canvasRef.current) {
        w = canvasRef.current.width = window.innerWidth
        h = canvasRef.current.height = window.innerHeight
        ctx.filter = `blur(${blur}px)`
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [blur])

  useEffect(() => {
    setIsSafari(
      typeof window !== 'undefined' &&
        navigator.userAgent.includes('Safari') &&
        !navigator.userAgent.includes('Chrome')
    )
  }, [])

  return (
    <div className={cn('relative flex h-full w-full', containerClassName)}>
      <canvas
        className="absolute inset-0 z-0 h-full w-full"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {})
        }}
      ></canvas>
      <div className={cn('relative z-10 h-full w-full', className)} {...props}>
        {children}
      </div>
    </div>
  )
}
