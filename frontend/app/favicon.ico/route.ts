import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const iconPath = join(process.cwd(), 'app', 'icon.svg');
    const iconSvg = readFileSync(iconPath, 'utf-8');
    
    return new NextResponse(iconSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    // Fallback SVG if file read fails
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="#f17a0a"/>
      <path d="M30 35 L50 55 L70 35" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M30 65 L50 45 L70 65" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`;
    
    return new NextResponse(fallbackSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }
}
