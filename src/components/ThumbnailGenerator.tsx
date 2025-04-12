'use client'

import { useState, useRef, useEffect } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { VideoCameraIcon } from '@heroicons/react/24/outline'
import VideoFrameSelector from './VideoFrameSelector'
import ThumbnailEditor from './ThumbnailEditor'

export default function ThumbnailGenerator() {
  const [video, setVideo] = useState<File | null>(null)
  const [frames, setFrames] = useState<string[]>([])
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'upload' | 'select' | 'edit'>('upload')
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('')
  const [currentFrame, setCurrentFrame] = useState(0)

  useEffect(() => {
    const loadFfmpeg = async () => {
      try {
        if (!ffmpegRef.current) {
          ffmpegRef.current = new FFmpeg()
          ffmpegRef.current.on('log', ({ message }) => {
            console.log('FFmpeg Log:', message)
            if (message.includes('frame=')) {
              const match = message.match(/frame=\s*(\d+)/)
              if (match) {
                const frameNumber = parseInt(match[1])
                setCurrentFrame(frameNumber)
                setProcessingStatus(`Processing frame ${frameNumber}...`)
              }
            }
          })
        }

        setProcessingStatus('Loading video processor...')
        await ffmpegRef.current.load({
          coreURL: '/ffmpeg-core.js',
          wasmURL: '/ffmpeg-core.wasm',
          workerURL: '/ffmpeg-core.worker.js'
        })
        setFfmpegLoaded(true)
        setProcessingStatus('')
      } catch (error) {
        console.error('Error loading FFmpeg:', error)
        setError('Failed to load video processor. Please try again.')
        setProcessingStatus('')
      }
    }
    loadFfmpeg()
  }, [])

  const extractFrames = async (videoFile: File) => {
    if (!ffmpegLoaded || !ffmpegRef.current) {
      throw new Error('Video processor not ready')
    }

    const ffmpeg = ffmpegRef.current
    
    try {
      setProcessingStatus('Loading video file...')
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))

      // Extract frames in a single command with smaller memory footprint
      setProcessingStatus('Extracting frames...')
      
      // Use a simple fps filter - 1 frame per 10 seconds
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', 'fps=1/10,scale=320:-1', // Lower resolution, 1 frame every 10 secs
        '-frames:v', '10',
        '-q:v', '5', // Lower quality (1-31, higher means lower quality)
        '-f', 'image2',
        'frame%d.jpg'
      ])

      setProcessingStatus('Reading frames...')
      const frames: string[] = []
      
      // Read 10 frames
      for (let i = 1; i <= 10; i++) {
        try {
          setProcessingStatus(`Reading frame ${i}/10...`)
          const data = await ffmpeg.readFile(`frame${i}.jpg`)
          if (data) {
            const blob = new Blob([data], { type: 'image/jpeg' })
            const url = URL.createObjectURL(blob)
            frames.push(url)
            setCurrentFrame(i)
          }
          // Clean up each frame after reading it
          try {
            await ffmpeg.deleteFile(`frame${i}.jpg`)
          } catch (e) {
            // Ignore deletion errors
          }
        } catch (error) {
          console.error(`Error reading frame ${i}:`, error)
        }
      }
      
      // Clean up
      try {
        await ffmpeg.deleteFile('input.mp4')
      } catch (e) {
        // Ignore deletion errors
      }
      
      if (frames.length === 0) {
        throw new Error('No frames could be extracted from video')
      }
      
      setFrames(frames)
      setProcessingStatus('')
    } catch (error) {
      console.error('Error in frame extraction:', error)
      throw new Error('Failed to process video. Please try with a shorter or smaller video file.')
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 100 * 1024 * 1024) {
      setError('Video file is too large. Please choose a file under 100MB.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setVideo(file)
      setCurrentFrame(0)
      await extractFrames(file)
      setStep('select')
    } catch (error) {
      console.error('Error processing video:', error)
      setError('Failed to process video. Please try again with a smaller video file.')
    } finally {
      setLoading(false)
    }
  }

  const handleFrameSelected = (frame: string) => {
    setSelectedFrame(frame)
    setStep('edit')
  }

  const handleThumbnailGenerated = (newThumbnails: string[]) => {
    setThumbnails(newThumbnails)
  }

  const handleBack = () => {
    switch (step) {
      case 'select':
        setVideo(null)
        setFrames([])
        setStep('upload')
        break
      case 'edit':
        setSelectedFrame(null)
        setStep('select')
        break
    }
  }

  if (step === 'upload') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <label className="block cursor-pointer">
            <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400">
              <VideoCameraIcon className="w-12 h-12 mx-auto text-gray-400" />
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-900">
                  {loading ? 'Processing video...' : 'Upload a video'}
                </p>
                {loading && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">{processingStatus}</p>
                    {currentFrame > 0 && (
                      <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${Math.min((currentFrame / 10) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
                {!loading && (
                  <p className="text-xs text-gray-500 mt-1">MP4, MOV up to 100MB</p>
                )}
              </div>
            </div>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              disabled={loading || !ffmpegLoaded}
              className="hidden"
            />
          </label>
        </div>
        {error && (
          <div className="text-red-500 bg-red-50 p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>
    )
  }

  if (step === 'select' && frames.length > 0) {
    return (
      <VideoFrameSelector
        frames={frames}
        onFrameSelected={handleFrameSelected}
        onBack={handleBack}
      />
    )
  }

  if (step === 'edit' && selectedFrame) {
    return (
      <ThumbnailEditor
        frame={selectedFrame}
        onThumbnailGenerated={handleThumbnailGenerated}
        onBack={handleBack}
      />
    )
  }

  return null
}