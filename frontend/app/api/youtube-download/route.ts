// app/api/youtube-download/route.ts
import { NextRequest, NextResponse } from 'next/server'
import ytdl from 'ytdl-core'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!ytdl.validateURL(url)) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    const info = await ytdl.getInfo(url)
    const format = ytdl.chooseFormat(info.formats, { quality: 'highest' })

    const videoStream = ytdl(url, { format: format })

    // Buffer to store video data
    const chunks: Uint8Array[] = []
    for await (const chunk of videoStream) {
      chunks.push(chunk)
    }
    const videoBuffer = Buffer.concat(chunks)

    // Set appropriate headers for video download
    const headers = new Headers()
    headers.set('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp4"`)
    headers.set('Content-Type', 'video/mp4')
    headers.set('Content-Length', videoBuffer.length.toString())

    return new NextResponse(videoBuffer, { headers })
  } catch (error) {
    console.error('Error downloading YouTube video:', error)
    return NextResponse.json({ error: 'Failed to download YouTube video' }, { status: 500 })
  }
}


