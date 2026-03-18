import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM_EMAIL ?? 'noreply@nationalflatpackassembly.co.uk'
const APP    = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nationalflatpackassembly.co.uk'

// ── Shared HTML wrapper ───────────────────────────────────────
function wrap(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f8f9fc;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8ecf0;">
        <!-- Header -->
        <tr>
          <td style="background:#0a1628;padding:24px 32px;">
            <span style="font-family:'Georgia',serif;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
              National <span style="color:#f0a500;">Flatpack</span> Assembly
            </span>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;">${body}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f0f2f5;font-size:12px;color:#94a3b8;text-align:center;">
            © 2026 National Flatpack Assembly Service Ltd · 
            <a href="${APP}" style="color:#94a3b8;text-decoration:none;">${APP.replace('https://','')}</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block;padding:13px 28px;background:#f0a500;color:#0a1628;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;margin-top:20px;">${label}</a>`
}

function h1(text: string) {
  return `<h1 style="font-size:22px;font-weight:700;color:#0a1628;margin:0 0 8px;letter-spacing:-0.5px;">${text}</h1>`
}

function p(text: string) {
  return `<p style="font-size:14px;color:#475569;line-height:1.7;margin:0 0 12px;">${text}</p>`
}

function infoBox(content: string) {
  return `<div style="background:#f8f9fc;border-radius:10px;padding:16px 20px;margin:16px 0;font-size:13px;color:#0a1628;border:1px solid #e8ecf0;">${content}</div>`
}

// ── Email senders ─────────────────────────────────────────────

/** Customer: job posted confirmation */
export async function sendJobPostedEmail(to: string, data: { customerName: string; jobTitle: string; jobId: string }) {
  return resend.emails.send({
    from:    FROM,
    to,
    subject: `Your job has been posted — ${data.jobTitle}`,
    html: wrap('Job Posted', `
      ${h1('Your job has been posted!')}
      ${p(`Hi ${data.customerName}, your job listing is now live and local fitters are being matched.`)}
      ${infoBox(`<strong>${data.jobTitle}</strong><br/>We'll notify you as soon as a fitter is matched.`)}
      ${p('Most jobs are matched within 24-48 hours. You can track progress in your dashboard.')}
      ${btn('View My Job', `${APP}/jobs/${data.jobId}`)}
    `),
  })
}

/** Customer: fitter has been matched */
export async function sendFitterMatchedEmail(to: string, data: {
  customerName: string; jobTitle: string; jobId: string
  fitterName: string; fitterEmail: string; fitterPhone?: string
}) {
  return resend.emails.send({
    from:    FROM,
    to,
    subject: `Great news — a fitter has been matched to your job`,
    html: wrap('Fitter Matched', `
      ${h1('Your fitter has been matched!')}
      ${p(`Hi ${data.customerName}, we've matched a local verified fitter to your job.`)}
      ${infoBox(`
        <div style="margin-bottom:8px;font-size:13px;font-weight:700;color:#15803d;">✓ Your Matched Fitter</div>
        <div style="font-weight:600;">${data.fitterName}</div>
        <div style="color:#475569;margin-top:4px;">
          ✉ <a href="mailto:${data.fitterEmail}" style="color:#1d4ed8;">${data.fitterEmail}</a>
          ${data.fitterPhone ? `&nbsp;&nbsp;📞 ${data.fitterPhone}` : ''}
        </div>
      `)}
      ${p('You can contact your fitter directly using the details above, or message them through your dashboard.')}
      ${btn('Go to My Dashboard', `${APP}/dashboard/customer?section=jobs`)}
    `),
  })
}

/** Fitter: new lead available in their area */
export async function sendNewLeadEmail(to: string, data: {
  fitterName: string; jobTitle: string; jobId: string
  town: string; estPrice: string; creditCost: number
}) {
  return resend.emails.send({
    from:    FROM,
    to,
    subject: `New lead in your area — ${data.jobTitle}`,
    html: wrap('New Lead', `
      ${h1('A new lead is available near you')}
      ${p(`Hi ${data.fitterName}, a new assembly job has been posted in your service area.`)}
      ${infoBox(`
        <div style="font-weight:700;margin-bottom:6px;">${data.jobTitle}</div>
        <div style="color:#475569;">📍 ${data.town} &nbsp;·&nbsp; 💷 Est. ${data.estPrice} &nbsp;·&nbsp; 🔐 ${data.creditCost} credit${data.creditCost !== 1 ? 's' : ''} to unlock</div>
      `)}
      ${p('Log in to view the full job details and unlock the lead before another fitter does.')}
      ${btn('View & Unlock Lead', `${APP}/jobs/${data.jobId}`)}
    `),
  })
}

/** Both parties: new message notification */
export async function sendMessageNotificationEmail(to: string, data: {
  recipientName: string; senderName: string; jobTitle: string
  messagePreview: string; jobId: string
}) {
  return resend.emails.send({
    from:    FROM,
    to,
    subject: `New message from ${data.senderName} — ${data.jobTitle}`,
    html: wrap('New Message', `
      ${h1(`Message from ${data.senderName}`)}
      ${p(`Hi ${data.recipientName}, you have a new message about your job.`)}
      ${infoBox(`
        <div style="font-size:12px;color:#94a3b8;margin-bottom:6px;">${data.jobTitle}</div>
        <div style="font-style:italic;color:#374151;">"${data.messagePreview.slice(0, 200)}${data.messagePreview.length > 200 ? '…' : ''}"</div>
      `)}
      ${btn('Reply in Dashboard', `${APP}/dashboard/customer?section=messages`)}
    `),
  })
}

/** Fitter: document approved / rejected */
export async function sendDocumentStatusEmail(to: string, data: {
  fitterName: string; docType: string; status: 'approved' | 'rejected'; notes?: string
}) {
  const isApproved = data.status === 'approved'
  const docLabel   = data.docType.replace(/_/g, ' ')
  return resend.emails.send({
    from:    FROM,
    to,
    subject: `Your ${docLabel} has been ${data.status}`,
    html: wrap(`Document ${data.status}`, `
      ${h1(`Document ${isApproved ? 'Approved ✓' : 'Rejected'}`)}
      ${p(`Hi ${data.fitterName}, your <strong>${docLabel}</strong> has been ${isApproved ? 'approved' : 'rejected'}.`)}
      ${isApproved
        ? infoBox(`✓ This document has been verified. Once all required documents are approved, your account will be fully activated and you can start unlocking leads.`)
        : infoBox(`Your document could not be approved. ${data.notes ? `Reason: ${data.notes}` : 'Please re-upload a clearer copy from your dashboard.'}`)}
      ${btn('Go to Dashboard', `${APP}/dashboard/fitter`)}
    `),
  })
}

/** Customer: job completed + leave review prompt */
export async function sendJobCompletedEmail(to: string, data: {
  customerName: string; jobTitle: string; jobId: string; fitterName: string
}) {
  return resend.emails.send({
    from:    FROM,
    to,
    subject: `Your job is complete — please leave a review`,
    html: wrap('Job Completed', `
      ${h1('Your job has been completed!')}
      ${p(`Hi ${data.customerName}, ${data.fitterName} has marked your job as complete.`)}
      ${infoBox(`<strong>${data.jobTitle}</strong><br/>Completed by ${data.fitterName}`)}
      ${p('We hope everything went well! Reviews help other customers choose trusted fitters — it only takes 30 seconds.')}
      ${btn('Leave a Review', `${APP}/dashboard/customer?section=history`)}
    `),
  })
}

/** Fitter: review received */
export async function sendReviewReceivedEmail(to: string, data: {
  fitterName: string; rating: number; comment?: string; jobTitle: string
}) {
  const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating)
  return resend.emails.send({
    from:    FROM,
    to,
    subject: `You received a ${data.rating}-star review`,
    html: wrap('New Review', `
      ${h1('You have a new review!')}
      ${p(`Hi ${data.fitterName}, a customer has left you a review.`)}
      ${infoBox(`
        <div style="font-size:18px;color:#f0a500;margin-bottom:6px;">${stars}</div>
        <div style="font-size:12px;color:#94a3b8;margin-bottom:8px;">${data.jobTitle}</div>
        ${data.comment ? `<div style="font-style:italic;color:#374151;">"${data.comment}"</div>` : ''}
      `)}
      ${btn('View My Reviews', `${APP}/dashboard/fitter?section=reviews`)}
    `),
  })
}

/** Welcome email — new customer */
export async function sendWelcomeCustomerEmail(to: string, data: { name: string }) {
  return resend.emails.send({
    from:    FROM,
    to,
    subject: `Welcome to National Flatpack Assembly`,
    html: wrap('Welcome', `
      ${h1(`Welcome, ${data.name}!`)}
      ${p('Your account is ready. Post your first job in under 2 minutes and we\'ll match you with a local verified fitter.')}
      ${p('It\'s completely free to post a job — you only pay your fitter directly for the work.')}
      ${btn('Post My First Job', `${APP}/dashboard/customer?section=post`)}
    `),
  })
}

/** Welcome email — new fitter */
export async function sendWelcomeFitterEmail(to: string, data: { name: string }) {
  return resend.emails.send({
    from:    FROM,
    to,
    subject: `Welcome to National Flatpack Assembly — Fitter Registration`,
    html: wrap('Welcome', `
      ${h1(`Welcome, ${data.name}!`)}
      ${p('Your fitter account has been created. Before you can unlock leads, you\'ll need to upload a couple of documents so we can verify your identity.')}
      ${infoBox(`
        <strong>Required documents:</strong><br/>
        <ul style="margin:8px 0 0 16px;padding:0;color:#475569;font-size:13px;line-height:1.8;">
          <li>Public Liability Insurance</li>
          <li>DBS Certificate (Enhanced)</li>
        </ul>
      `)}
      ${p('Once verified (usually within 48 hours) you\'ll be able to browse leads in your area.')}
      ${btn('Upload Documents', `${APP}/dashboard/fitter`)}
    `),
  })
}
