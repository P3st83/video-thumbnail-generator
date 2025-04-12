import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import ffmpeg from 'fluent-ffmpeg'
import { mkdir } from 'fs/promises'

// Configure paths
const uploadsDir = join(process.cwd(), 'public', 'uploads')
const framesDir = join(uploadsDir, 'frames')

export async function POST(request: NextRequest) {
  try {
    // Ensure directories exist
    await mkdir(uploadsDir, { recursive: true })
    await mkdir(framesDir, { recursive: true })

    const formData = await request.formData()
    const video = formData.get('video') as File

    if (!video) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      )
    }

    // Save video to disk
    const videoBuffer = Buffer.from(await video.arrayBuffer())
    const videoPath = join(uploadsDir, `video-${Date.now()}.mp4`)
    await writeFile(videoPath, videoBuffer)

    // Extract frames
    const frames: string[] = []
    const frameCount = 6 // Number of frames to extract

    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .screenshots({
          count: frameCount,
          folder: framesDir,
          filename: `frame-%i.jpg`,
          size: '1280x720'
        })
    })

    // Get frame paths
    const framePaths = Array.from({ length: frameCount }, (_, i) => 
      `/uploads/frames/frame-${i + 1}.jpg`
    )

    return NextResponse.json({ frames: framePaths })
  } catch (error) {
    console.error('Error processing video:', error)
    return NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    )
  }
} 