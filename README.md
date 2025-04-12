# Video Thumbnail Generator

A powerful web application for generating professional-looking thumbnails from video files. This tool allows you to extract frames from videos, select the best one, and enhance it with various image processing effects.

![Video Thumbnail Generator](screenshot.jpg)

## Features

- **Video Frame Extraction**: Upload videos and extract frames using FFmpeg.wasm
- **Frame Selection**: Browse and select the perfect frame for your thumbnail
- **Professional Enhancement**: Apply various enhancements to your selected frame
  - Darken images
  - Increase contrast
  - Add vibrancy
  - Apply cinematic effects
- **One-Click Download**: Download your enhanced thumbnail with a single click
- **Cross-Origin Isolation**: Properly configured for FFmpeg.wasm requirements
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Image Processing**: Sharp (Node.js)
- **Video Processing**: FFmpeg.wasm (browser-based)
- **Icons**: Heroicons

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/video-thumbnail-generator.git
   cd video-thumbnail-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to http://localhost:3000

### Building for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Usage Guide

### 1. Upload a Video

- Click the upload area or drag and drop a video file (MP4, MOV formats supported)
- Videos up to 100MB are supported
- The app will process your video and extract key frames

### 2. Select a Frame

- Browse through the extracted frames
- Click on a frame to select it
- Preview the selected frame in a larger view
- Click "Continue with Selected Frame" when you're satisfied

### 3. Enhance Your Thumbnail

- Add enhancement instructions in the text area (e.g., "make it darker", "increase contrast")
- Click "Generate Thumbnail" to process your image
- The app will apply professional image processing based on your instructions
- Server-side processing with Sharp ensures high-quality results

### 4. Download Your Thumbnail

- Preview your enhanced thumbnail
- Click "Download Thumbnail" to save the image to your device
- Use your new thumbnail for YouTube, social media, or any other platform

## How It Works

1. **Frame Extraction**: Uses FFmpeg.wasm to process videos directly in the browser without server uploads
2. **Image Enhancement**: Processes images on the server using Sharp with intelligent enhancement based on your instructions
3. **Optimization**: Applies appropriate adjustments for different enhancement types (darkness, contrast, vibrancy)

## Troubleshooting

- **Video Won't Load**: Ensure your browser supports SharedArrayBuffer (modern Chrome, Firefox, Edge)
- **Processing Errors**: Try with a smaller or shorter video file
- **Enhancement Issues**: Try different prompts or refresh the page

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) for browser-based video processing
- [Sharp](https://sharp.pixelplumbing.com/) for high-performance image processing
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling 