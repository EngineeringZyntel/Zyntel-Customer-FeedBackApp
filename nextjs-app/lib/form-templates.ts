/**
 * Shared form templates for create/edit – used by Templates tab
 */

export interface FormTemplate {
  name: string
  title: string
  description: string
  industry?: string
  fields: {
    label: string
    type: string
    options?: string[]
    maxRating?: number
  }[]
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    name: 'Event feedback',
    title: 'Event Feedback',
    description: 'Help us improve future events. Your feedback is valuable.',
    industry: 'Events',
    fields: [
      { label: 'How would you rate the event?', type: 'rating', maxRating: 5 },
      { label: 'What did you enjoy most?', type: 'textarea' },
      { label: 'What could we improve?', type: 'textarea' },
      { label: 'Would you attend again?', type: 'select', options: ['Yes', 'No', 'Maybe'] },
    ],
  },
  {
    name: 'NPS',
    title: 'Net Promoter Score',
    description: 'How likely are you to recommend us to a friend or colleague?',
    fields: [
      { label: 'On a scale of 0–10, how likely are you to recommend us?', type: 'rating', maxRating: 10 },
      { label: 'What is the main reason for your score?', type: 'textarea' },
    ],
  },
  {
    name: 'Contact',
    title: 'Contact Us',
    description: "Send us a message and we'll get back to you.",
    fields: [
      { label: 'Your name', type: 'text' },
      { label: 'Email', type: 'email' },
      { label: 'Subject', type: 'select', options: ['General inquiry', 'Support', 'Feedback', 'Other'] },
      { label: 'Message', type: 'textarea' },
    ],
  },
  {
    name: 'Patient satisfaction',
    title: 'Patient Satisfaction Survey',
    description: 'Your feedback helps us improve our healthcare services.',
    industry: 'Healthcare',
    fields: [
      { label: 'How would you rate your overall experience?', type: 'rating', maxRating: 5 },
      { label: 'How satisfied were you with the wait time?', type: 'rating', maxRating: 5 },
      { label: 'How would you rate the staff professionalism?', type: 'rating', maxRating: 5 },
      { label: 'Was your concern adequately addressed?', type: 'select', options: ['Yes', 'No', 'Partially'] },
      { label: 'Additional comments or suggestions', type: 'textarea' },
    ],
  },
  {
    name: 'Appointment booking',
    title: 'Appointment Request',
    description: 'Request an appointment with our healthcare team.',
    industry: 'Healthcare',
    fields: [
      { label: 'Full name', type: 'text' },
      { label: 'Phone number', type: 'tel' },
      { label: 'Email', type: 'email' },
      { label: 'Preferred date', type: 'date' },
      { label: 'Type of appointment', type: 'select', options: ['Consultation', 'Follow-up', 'Routine checkup', 'Emergency'] },
      { label: 'Reason for visit', type: 'textarea' },
    ],
  },
  {
    name: 'Medical survey',
    title: 'Patient Health Survey',
    description: 'Help us understand your health needs better.',
    industry: 'Healthcare',
    fields: [
      { label: 'Age range', type: 'select', options: ['Under 18', '18-30', '31-50', '51-70', 'Over 70'] },
      { label: 'Do you have any chronic conditions?', type: 'checkbox', options: ['Diabetes', 'Hypertension', 'Asthma', 'Heart disease', 'None'] },
      { label: 'Are you currently taking any medications?', type: 'select', options: ['Yes', 'No'] },
      { label: 'Please list your medications (if applicable)', type: 'textarea' },
      { label: 'Do you have any allergies?', type: 'textarea' },
    ],
  },
  {
    name: 'Event registration',
    title: 'Event Registration',
    description: 'Register for our upcoming event.',
    industry: 'Events',
    fields: [
      { label: 'Full name', type: 'text' },
      { label: 'Email', type: 'email' },
      { label: 'Phone number', type: 'tel' },
      { label: 'Organization', type: 'text' },
      { label: 'Ticket type', type: 'select', options: ['General admission', 'VIP', 'Student', 'Group'] },
      { label: 'Dietary requirements', type: 'checkbox', options: ['Vegetarian', 'Vegan', 'Gluten-free', 'None'] },
      { label: 'How did you hear about this event?', type: 'select', options: ['Social media', 'Email', 'Friend', 'Website', 'Other'] },
    ],
  },
  {
    name: 'Post-event survey',
    title: 'Post-Event Survey',
    description: 'Thank you for attending! Please share your thoughts.',
    industry: 'Events',
    fields: [
      { label: 'Overall event rating', type: 'rating', maxRating: 5 },
      { label: 'How would you rate the venue?', type: 'rating', maxRating: 5 },
      { label: 'How would you rate the content/speakers?', type: 'rating', maxRating: 5 },
      { label: 'Was the event well-organized?', type: 'select', options: ['Excellent', 'Good', 'Average', 'Poor'] },
      { label: 'What did you like most?', type: 'textarea' },
      { label: 'What could be improved?', type: 'textarea' },
      { label: 'Would you attend future events?', type: 'select', options: ['Definitely', 'Probably', 'Maybe', 'No'] },
    ],
  },
  {
    name: 'Vendor application',
    title: 'Event Vendor Application',
    description: 'Apply to be a vendor at our event.',
    industry: 'Events',
    fields: [
      { label: 'Business name', type: 'text' },
      { label: 'Contact person', type: 'text' },
      { label: 'Email', type: 'email' },
      { label: 'Phone', type: 'tel' },
      { label: 'Type of products/services', type: 'textarea' },
      { label: 'Booth size needed', type: 'select', options: ['Small (10x10)', 'Medium (10x20)', 'Large (20x20)'] },
      { label: 'Have you been a vendor before?', type: 'select', options: ['Yes', 'No'] },
    ],
  },
]
