'use client'

import { useState } from 'react'
import Image from 'next/image'

interface VideoFrameSelectorProps {
  frames: string[]
  onFrameSelected: (frame: string) => void
  onBack: () => void
}

export default function VideoFrameSelector({
  frames,
  onFrameSelected,
  onBack,
}: VideoFrameSelectorProps) {
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})

  const handleImageLoad = (frame: string) => {
    setLoadedImages(prev => ({
      ...prev,
      [frame]: true
    }))
  }

  const handleFrameClick = (frame: string) => {
    setSelectedFrame(frame)
  }

  const handleContinue = () => {
    if (selectedFrame) {
      onFrameSelected(selectedFrame)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Select a Frame
        </h2>
        <button
          onClick={onBack}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to upload
        </button>
      </div>

      {/* Selected frame preview */}
      {selectedFrame && (
        <div className="flex justify-center mb-6">
          <div className="relative max-w-2xl w-full">
            <Image
              src={selectedFrame}
              alt="Selected frame"
              width={1280}
              height={720}
              className="w-full rounded-lg shadow-lg"
              priority
            />
          </div>
        </div>
      )}

      {/* Frame grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {frames.map((frame, index) => (
          <button
            key={index}
            onClick={() => handleFrameClick(frame)}
            className="relative aspect-video group overflow-hidden rounded-lg border-2 border-transparent hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <img
              src={frame}
              alt={`Frame ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!selectedFrame}
          className={`px-4 py-2 rounded-md text-white ${
            selectedFrame
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Continue with Selected Frame
        </button>
      </div>
    </div>
  )
} 