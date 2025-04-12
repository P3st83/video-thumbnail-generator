'use client'

import { useState, useEffect } from 'react'

interface ThumbnailEditorProps {
  frame: string
  onThumbnailGenerated: (thumbnails: string[]) => void
  onBack: () => void
}

export default function ThumbnailEditor({
  frame,
  onThumbnailGenerated,
  onBack,
}: ThumbnailEditorProps) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null)
  const [generationProgress, setGenerationProgress] = useState('')
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [usingLocalFallback, setUsingLocalFallback] = useState(false)
  const [enhancementInfo, setEnhancementInfo] = useState<{
    modelInfo?: string;
    enhancementType?: string;
  }>({});

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  // Helper function to convert image to proper format
  const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
    try {
      if (imageUrl.startsWith('data:')) {
        return imageUrl; // Already in data URL format
      }
      
      console.log('Converting image URL to base64:', imageUrl.substring(0, 30) + '...');
      
      // Fetch the image and convert to base64
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Ensure the data URL is in a supported format (JPEG)
          const formattedData = base64data.replace(/^data:image\/\w+;base64,/, 'data:image/jpeg;base64,');
          console.log('Converted image format:', formattedData.substring(0, 30) + '...');
          resolve(formattedData);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image:', error);
      throw new Error('Failed to process image for enhancement');
    }
  };

  const generateThumbnail = async () => {
    try {
      // Clear any previous errors and set loading state
      setLoading(true)
      setError(null)
      setGenerationProgress('Preparing image...')

      // Convert image to proper format
      const processedImage = await convertImageToBase64(frame);

      setGenerationProgress('Processing with image enhancement...');
      
      // Prepare the request
      const requestBody = {
        image: processedImage,
        prompt: prompt || 'Enhance this image, make it more vibrant and clear',
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.thumbnailUrl) {
        throw new Error('No thumbnail URL in response');
      }
      
      const thumbnailUrl = data.thumbnailUrl;
      
      // Store enhancement info if available
      if (data.modelInfo || data.enhancementType) {
        setEnhancementInfo({
          modelInfo: data.modelInfo,
          enhancementType: data.enhancementType
        });
      }
      
      setUsingLocalFallback(false);
      setGenerationProgress('Finalizing thumbnail...');
      
      // Preload the image
      setGeneratedThumbnail(thumbnailUrl);
      onThumbnailGenerated([thumbnailUrl]);
      setGenerationProgress('');
      
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Failed to generate thumbnail. Please try again.');
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setTimeoutId(null);
      setLoading(false);
    }
  }

  const downloadThumbnail = async () => {
    if (!generatedThumbnail) return;
    
    try {
      // For base64 data URLs, download directly
      if (generatedThumbnail.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = generatedThumbnail;
        a.download = 'enhanced-thumbnail.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      
      // For proxied URLs or external URLs, fetch first
      const response = await fetch(generatedThumbnail);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'enhanced-thumbnail.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading thumbnail:', error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Enhance Your Thumbnail
        </h2>
        <button
          onClick={onBack}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to frame selection
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Selected Frame</h3>
          <img
            src={frame}
            alt="Selected frame"
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enhancement Instructions
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe how you want to enhance the thumbnail (e.g., 'Make it more vibrant' or 'Increase contrast'). Keep it simple and focused on visual improvements."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col space-y-4">
            {!generatedThumbnail && (
              <button
                onClick={generateThumbnail}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Generate Thumbnail'}
              </button>
            )}

            {loading && generationProgress && (
              <div className="text-sm text-gray-600 mt-2 flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div>
                  <p>{generationProgress}</p>
                  <p className="text-xs text-gray-500 mt-1">This may take up to 30 seconds.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-500 bg-red-50 p-4 rounded-lg">
                {error}
                {loading === false && (
                  <button 
                    onClick={generateThumbnail}
                    className="mt-3 bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 text-sm"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}

            {generatedThumbnail && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Enhanced Thumbnail</h3>
                {enhancementInfo.enhancementType && (
                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mb-3">
                    <p>
                      Enhancement type: <strong>{enhancementInfo.enhancementType.replace(/-/g, ' ')}</strong>
                      {enhancementInfo.modelInfo && (
                        <span className="text-xs block mt-1 text-gray-500">
                          Using advanced image processing
                        </span>
                      )}
                    </p>
                  </div>
                )}
                <img 
                  src={generatedThumbnail} 
                  alt="Generated thumbnail" 
                  className="w-full rounded-lg shadow-lg" 
                />
                <button
                  onClick={downloadThumbnail}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                >
                  Download Thumbnail
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 