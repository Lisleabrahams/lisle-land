import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const fileUrl = searchParams.get('url')
  
  if (!fileUrl) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
  }

  // Only allow Sanity CDN URLs for security
  if (!fileUrl.startsWith('https://cdn.sanity.io/')) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 403 })
  }

  try {
    const response = await fetch(fileUrl)
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: response.status })
    }

    const arrayBuffer = await response.arrayBuffer()
    
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 })
  }
}