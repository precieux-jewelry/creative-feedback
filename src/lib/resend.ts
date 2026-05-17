import { Resend } from 'resend'

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === 'placeholder_add_later') return null
  return new Resend(apiKey)
}

export async function sendReviewReadyEmail({
  to,
  videoName,
  reviewUrl,
}: {
  to: string
  videoName: string
  reviewUrl: string
}) {
  const resend = getResendClient()
  if (!resend) return // Resend not configured yet — skip silently

  await resend.emails.send({
    from: 'Creative Feedback <onboarding@resend.dev>',
    to,
    subject: `Your video review is ready — ${videoName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#09090b;color:#fafafa;">
        <div style="margin-bottom:24px;">
          <div style="display:inline-flex;align-items:center;gap:8px;">
            <div style="width:28px;height:28px;background:#8b5cf6;border-radius:8px;display:flex;align-items:center;justify-content:center;">
              <span style="color:white;font-weight:700;font-size:12px;">CF</span>
            </div>
            <span style="color:white;font-weight:600;font-size:15px;">Creative Feedback</span>
          </div>
        </div>

        <h1 style="color:#fafafa;font-size:22px;font-weight:700;margin:0 0 8px;">Your video review is ready ✨</h1>
        <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin:0 0 24px;">
          We've finished analyzing <strong style="color:#fafafa;">${videoName}</strong>. Your AI-powered feedback is waiting — including hook analysis, retention insights, suggested captions, and more.
        </p>

        <a href="${reviewUrl}" style="display:inline-block;background:#8b5cf6;color:white;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px;">
          View Your Review →
        </a>

        <p style="color:#52525b;font-size:12px;margin-top:32px;line-height:1.6;">
          This email was sent because you uploaded a video to Creative Feedback.<br/>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#8b5cf6;">creativefeedback.app</a>
        </p>
      </div>
    `,
  })
}
