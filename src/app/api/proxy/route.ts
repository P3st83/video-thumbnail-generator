import { NextRequest, NextResponse } from 'next/server';

/**
 * This endpoint acts as a proxy for the Fal.ai image URL to avoid CORS issues.
 * It fetches the image from Fal.ai and serves it from our own domain.
 */
export async function GET(request: NextRequest) {
  // Get the URL from the query parameter
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json(
      { error: 'Image URL is required' },
      { status: 400 }
    );
  }

  try {
    // Validate that the URL is from Fal.ai to prevent abuse
    if (!imageUrl.startsWith('https://v3.fal.media/') && !imageUrl.includes('fal.ai')) {
      return NextResponse.json(
        { error: 'Only Fal.ai URLs are allowed' },
        { status: 403 }
      );
    }

    // Fetch the image
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the content type from the response
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Get the image as array buffer
    const imageBuffer = await response.arrayBuffer();

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin'
      }
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 500 }
    );
  }
} 