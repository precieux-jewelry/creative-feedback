import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: video } = await supabase.from('videos').select('video_url').eq('id', id).single()

  if (video?.video_url) {
    const url = new URL(video.video_url)
    const storagePath = url.pathname.split('/object/public/videos/')[1]
    if (storagePath) {
      await supabase.storage.from('videos').remove([storagePath])
    }
  }

  await supabase.from('videos').delete().eq('id', id)

  return NextResponse.json({ success: true })
}
