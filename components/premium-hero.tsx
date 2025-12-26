"use client"

import { motion } from "framer-motion"
import { FileText } from "lucide-react"

export function PremiumHero() {
  return (
    <div className="relative w-full min-h-[70vh] overflow-hidden">
      {/* Animation Styles */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 60s linear infinite;
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 60s linear infinite;
        }
      `}</style>

      {/* Background Decorative Layer */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          perspective: "1200px",
          transform: "perspective(1200px) rotateX(15deg)",
          transformOrigin: "center bottom",
        }}
      >
        {/* Outer ring - spins clockwise */}
        <div className="absolute inset-0 animate-spin-slow">
          <div
            className="absolute top-1/2 left-1/2"
            style={{
              width: "1400px",
              height: "1400px",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="w-full h-full rounded-full border border-primary/10" />
          </div>
        </div>

        {/* Middle ring - spins counter-clockwise */}
        <div className="absolute inset-0 animate-spin-slow-reverse">
          <div
            className="absolute top-1/2 left-1/2"
            style={{
              width: "1000px",
              height: "1000px",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="w-full h-full rounded-full border border-primary/20" />
          </div>
        </div>

        {/* Inner ring - spins clockwise */}
        <div className="absolute inset-0 animate-spin-slow">
          <div
            className="absolute top-1/2 left-1/2"
            style={{
              width: "600px",
              height: "600px",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="w-full h-full rounded-full border border-primary/30" />
          </div>
        </div>

        {/* Center glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to top, hsl(var(--background)) 5%, hsl(var(--background) / 0.8) 40%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-center pt-20 pb-8 gap-6">
        {/* App Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2"
        >
          <FileText className="w-8 h-8 text-primary" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-center tracking-tight"
        >
          Transform PDFs into
          <span className="block text-primary">Insights</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-muted-foreground text-center max-w-md"
        >
          AI-powered document analysis with visual diagrams.
          Upload any PDF and get instant, structured insights.
        </motion.p>
      </div>
    </div>
  )
}
