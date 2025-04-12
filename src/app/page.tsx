'use client';

import ThumbnailGenerator from '@/components/ThumbnailGenerator';

export default function Home() {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            Next.js + Sharp
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 gradient-text">
            Video Thumbnail Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your videos into eye-catching thumbnails with professional enhancements.
            Upload a video, select a frame, and enhance it into a polished thumbnail.
          </p>
        </header>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ThumbnailGenerator />
        </div>
      </div>
    </div>
  );
} 