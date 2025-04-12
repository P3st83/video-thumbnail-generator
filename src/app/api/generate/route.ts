import { NextResponse } from 'next/server';
import sharp from 'sharp';

// Helper function to properly format the image data
const formatImageData = (imageData: string): string => {
  // If it's already a full data URL, return as is
  if (imageData.startsWith('data:image/')) {
    return imageData;
  }
  
  // If it's a base64 string without prefix, add the prefix
  if (!imageData.startsWith('http')) {
    return `data:image/jpeg;base64,${imageData}`;
  }
  
  // If it's a URL, return as is
  return imageData;
};

// Image processing function using Sharp (server-side processing)
async function enhanceImageWithSharp(imageData: string, enhancementType: string): Promise<Buffer> {
  try {
    // Extract base64 data from data URL
    let imageBuffer: Buffer;
    
    if (imageData.startsWith('data:image/')) {
      const base64Data = imageData.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      // Handle URL or direct base64
      const response = await fetch(imageData);
      imageBuffer = Buffer.from(await response.arrayBuffer());
    }
    
    // Create sharp instance
    let sharpInstance = sharp(imageBuffer);
    
    // Process based on enhancement type - ENHANCED PARAMETERS FOR MORE NOTICEABLE CHANGES
    if (enhancementType.toLowerCase().includes('dark')) {
      // Darken the image - more noticeable effect
      sharpInstance = sharpInstance
        .modulate({
          brightness: 0.7,    // Reduce brightness more significantly
          saturation: 1.3     // Increase saturation more
        })
        .gamma(1.3);          // Stronger contrast in midtones
    } 
    
    if (enhancementType.toLowerCase().includes('contrast') || 
        enhancementType.toLowerCase().includes('cinematic')) {
      // Increase contrast, add cinematic look - more noticeable effect
      sharpInstance = sharpInstance
        .modulate({
          brightness: 0.9,    // Slightly darker
          saturation: 1.4     // Stronger color saturation
        })
        .gamma(1.4)           // Stronger contrast in midtones
        .tint("#ffb56b");     // Add more cinematic warmth
    }
    
    if (enhancementType.toLowerCase().includes('vibrant')) {
      // Make colors more vibrant - much stronger effect
      sharpInstance = sharpInstance
        .modulate({
          brightness: 1.1,    // More brightness
          saturation: 1.6     // Much higher saturation
        })
        .gamma(1.2);          // More contrast
    }
    
    // Default enhancement if no specific type matches - make this stronger too
    if (!enhancementType.toLowerCase().includes('dark') && 
        !enhancementType.toLowerCase().includes('contrast') && 
        !enhancementType.toLowerCase().includes('cinematic') && 
        !enhancementType.toLowerCase().includes('vibrant')) {
      
      // General enhancement with stronger parameters
      sharpInstance = sharpInstance
        .modulate({
          brightness: 1.15,   // Increased brightness
          saturation: 1.45    // Significantly increased saturation
        })
        .gamma(1.25);         // More pronounced contrast
    }
    
    // Apply stronger sharpening to all enhancements
    sharpInstance = sharpInstance.sharpen(
      1.5,  // sigma - Increase radius of sharpening effect
      1.2,  // flat - Enhanced flat areas
      1.0   // jagged - Enhanced edge contrast
    );
    
    // Convert to JPEG with high quality
    const processedBuffer = await sharpInstance
      .jpeg({ quality: 92, progressive: true })
      .toBuffer();
      
    return processedBuffer;
  } catch (error) {
    console.error('Error in Sharp image processing:', error);
    throw new Error('Failed to process image with Sharp');
  }
}

export async function POST(req: Request) {
  try {
    const { image, prompt } = await req.json();

    if (!image) {
      throw new Error('Image data is required');
    }

    // Process image data
    const imageData = formatImageData(image);
    
    // Log just the beginning of the image data for debugging
    console.log(`Image data format: ${imageData.substring(0, 50)}...`);

    // Prepare the request
    const enhancedPrompt = prompt || 'enhance this image';

    console.log(`Processing image with prompt: ${enhancedPrompt}`);

    // Process with Sharp
    const processedBuffer = await enhanceImageWithSharp(imageData, enhancedPrompt);
    
    // Convert to base64 for response
    const base64Image = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;
    
    // Determine the enhancement type for better user feedback
    let enhancementTypeDesc = 'standard image enhancement';
    if (enhancedPrompt.toLowerCase().includes('vibrant')) {
      enhancementTypeDesc = 'vibrant color enhancement';
    } else if (enhancedPrompt.toLowerCase().includes('contrast')) {
      enhancementTypeDesc = 'high-contrast enhancement';
    } else if (enhancedPrompt.toLowerCase().includes('cinematic')) {
      enhancementTypeDesc = 'cinematic color grading';
    } else if (enhancedPrompt.toLowerCase().includes('dark')) {
      enhancementTypeDesc = 'dark mood enhancement';
    } else if (enhancedPrompt.toLowerCase().includes('sharp')) {
      enhancementTypeDesc = 'detail-enhancing sharpening';
    }
    
    return NextResponse.json({
      thumbnailUrl: base64Image,
      modelInfo: 'sharp-local-processing',
      enhancementType: enhancementTypeDesc,
      success: true
    });
    
  } catch (error: any) {
    console.error('Error in thumbnail generation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate thumbnail' },
      { status: 500 }
    );
  }
} 