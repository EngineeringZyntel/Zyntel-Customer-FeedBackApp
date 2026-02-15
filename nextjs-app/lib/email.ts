/**
 * Email Notification Service
 * Sends email notifications for form responses using Resend
 */

import { Resend } from 'resend'

// Initialize Resend (will use RESEND_API_KEY from env)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface FormResponse {
  formTitle: string
  formId: number
  responseData: Record<string, any>
  submittedAt: Date
}

/**
 * Send notification email when a form response is submitted
 */
export async function sendResponseNotification(
  toEmail: string,
  response: FormResponse
): Promise<{ success: boolean; error?: string }> {
  // Skip if Resend not configured
  if (!resend) {
    console.log('Resend not configured, skipping email notification')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Zyntel Feedback <notifications@yourdomain.com>',
      to: toEmail,
      subject: `New response: ${response.formTitle}`,
      html: generateResponseEmailHtml(response),
    })

    return { success: true }
  } catch (error) {
    console.error('Email notification error:', error)
    // Don't throw - email failure shouldn't block form submission
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Generate HTML email template for form response
 */
function generateResponseEmailHtml(response: FormResponse): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const formUrl = `${baseUrl}/dashboard/forms/${response.formId}`
  
  const responseRows = Object.entries(response.responseData)
    .map(([key, value]) => {
      let displayValue = value
      if (Array.isArray(value)) {
        displayValue = value.join(', ')
      }
      
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; font-weight: 600; color: #374151; vertical-align: top;">${escapeHtml(key)}</td>
          <td style="padding: 12px; color: #6b7280;">${escapeHtml(String(displayValue))}</td>
        </tr>
      `
    })
    .join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0066FF; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                📋 New Form Response
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                You've received a new response for <strong>${escapeHtml(response.formTitle)}</strong>
              </p>
              
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px;">
                Submitted on ${response.submittedAt.toLocaleString('en-US', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                })}
              </p>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                ${responseRows}
              </table>
              
              <div style="margin-top: 30px; text-align: center;">
                <a href="${formUrl}" style="display: inline-block; background-color: #0066FF; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                  View All Responses
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                This email was sent by Zyntel Feedback. To manage your notification settings, visit your dashboard.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

/**
 * Escape HTML to prevent XSS in emails
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
