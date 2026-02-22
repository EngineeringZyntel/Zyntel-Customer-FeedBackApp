/**
 * Help Center Page
 * 
 * Guides and tutorials for using Zyntel Feedback
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const guides = [
  {
    id: 'getting-started',
    category: 'Getting Started',
    title: 'Create Your First Form',
    content: `
1. **Log in to your dashboard** - Navigate to your dashboard after logging in.

2. **Click "Create Form"** - Find the blue button in the top right corner.

3. **Choose a template (optional)** - Select from Healthcare, Events, or General templates, or start from scratch.

4. **Add form details** - Enter a title and description for your form.

5. **Add fields** - Click "Add Field" to add questions. Choose from:
   - Text (short answer)
   - Email, Number, Phone, Date
   - Textarea (long answer)
   - Dropdown, Multiple Choice, Checkbox
   - Rating (stars)

6. **Configure options** - For dropdowns and checkboxes, add options by clicking "Add Option".

7. **Set optional settings**:
   - Thank-you message
   - Redirect URL
   - Close date
   - Response limit

8. **Click "Create Form"** - Your form is ready! You'll be redirected to your dashboard.

9. **Share your form** - Click on your form to get the link and QR code.
    `,
  },
  {
    id: 'share-form',
    category: 'Sharing',
    title: 'How to Share Your Form',
    content: `
**Copy the Link:**
1. Go to your form details page
2. Click "Copy Link"
3. Share the link via email, social media, or messaging apps

**Use the QR Code:**
1. Open your form details page
2. Find the QR code in the sidebar
3. Click "Download" to save it as an image
4. Click "Print" to print it for events or posters

**Embed on Your Website:**
1. Go to the QR code section on form details
2. Find the "Embed on your site" section
3. Click "Copy embed code"
4. Paste the code into your website's HTML

**Best Practices:**
- For events: Print QR codes on posters and badges
- For email campaigns: Include both link and QR code
- For websites: Embed directly for seamless experience
    `,
  },
  {
    id: 'view-responses',
    category: 'Responses',
    title: 'Viewing and Managing Responses',
    content: `
**View Responses:**
1. Click on a form from your dashboard
2. Go to the "Responses" tab
3. Toggle between Card View and Table View

**Card View:**
- Shows each response as a separate card
- Easy to read individual submissions
- Good for detailed review

**Table View:**
- Shows all responses in a spreadsheet-like format
- Each question is a column
- Each response is a row
- Great for comparing responses

**Export Data:**
1. Click "Export CSV" in the responses tab
2. Open the file in Excel or Google Sheets
3. Analyze, filter, and create charts

**Analytics:**
- Switch to the "Analytics" tab
- View total responses and trends
- See daily response charts
- Export data for deeper analysis
    `,
  },
  {
    id: 'form-settings',
    category: 'Configuration',
    title: 'Form Settings and Configuration',
    content: `
**Close Date:**
- Set a date when the form should stop accepting responses
- Useful for event registrations or time-limited surveys
- Respondents will see "Form closed" message after this date

**Response Limit:**
- Set maximum number of responses
- Once reached, form stops accepting submissions
- Great for limited-capacity events or beta programs

**Thank-You Message:**
- Customize the message shown after submission
- Add next steps or contact information
- Keep it brief and friendly

**Redirect URL:**
- Redirect respondents to another page after submission
- Use for:
  - Your website homepage
  - A special offer page
  - Payment or registration pages
- Redirect happens 3 seconds after submission

**Email Notifications** (Coming soon):
- Get notified when someone submits
- Configure in form settings
    `,
  },
  {
    id: 'templates',
    category: 'Templates',
    title: 'Using Templates',
    content: `
**Why Use Templates?**
- Save time with pre-built forms
- Industry-specific best practices
- Easily customizable

**Available Templates:**

**Healthcare:**
- Patient Satisfaction Survey
- Appointment Request
- Patient Health Survey

**Events:**
- Event Registration
- Post-Event Survey
- Vendor Application

**General:**
- NPS (Net Promoter Score)
- Contact Form
- General Feedback

**How to Use:**
1. Click "Create Form"
2. Choose a template from the category
3. Customize the title, description, and fields
4. Add or remove fields as needed
5. Click "Create Form"
    `,
  },
  {
    id: 'trash-restore',
    category: 'Management',
    title: 'Managing Deleted Forms',
    content: `
**Deleting a Form:**
1. Go to your form details page
2. Click "Delete Form"
3. Confirm deletion
4. Form is moved to Trash (not permanently deleted)

**Viewing Trash:**
- Click "Trash" in the dashboard navigation
- See all deleted forms
- Forms stay in trash for 30 days

**Restoring a Form:**
1. Go to the Trash page
2. Find the form you want to restore
3. Click "Restore"
4. Form returns to your dashboard with all responses intact

**Permanent Deletion:**
1. In Trash, click "Delete Forever"
2. Confirm - this action cannot be undone
3. Form and all responses are permanently removed

**Auto-Cleanup:**
- Forms in trash for 30+ days are automatically deleted
- Export responses before deletion if needed
    `,
  },
  {
    id: 'duplicate',
    category: 'Management',
    title: 'Duplicating Forms',
    content: `
**Why Duplicate?**
- Reuse form structure for similar purposes
- Create variations for different audiences
- Save time building from scratch

**How to Duplicate:**
1. Open a form details page
2. Click "Duplicate Form"
3. A copy is created with "(copy)" in the title
4. New unique form code is generated
5. All fields and settings are copied
6. Responses are NOT copied (fresh start)

**What Gets Copied:**
- Title and description
- All fields and their settings
- Form customization
- Thank-you message
- Redirect URL
- Close date and response limit

**What Doesn't Get Copied:**
- Responses
- Response count
- Form code (new one is generated)

**Best Practices:**
- Edit the title after duplicating
- Review settings before sharing
- Adjust dates and limits as needed
    `,
  },
]

export default function HelpPage() {
  const [selectedGuide, setSelectedGuide] = useState(guides[0])
  const [searchTerm, setSearchTerm] = useState('')

  const categories = Array.from(new Set(guides.map(g => g.category)))

  const filteredGuides = guides.filter(
    g => g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         g.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Help Center</h1>
            <p className="text-text-secondary mt-1">Guides and tutorials for using Zyntel Feedback</p>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search for help..."
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <div key={category}>
                    <div className="text-sm font-medium text-text-secondary mb-2">{category}</div>
                    {filteredGuides.filter(g => g.category === category).map((guide) => (
                      <button
                        key={guide.id}
                        onClick={() => setSelectedGuide(guide)}
                        className={`w-full text-left text-sm px-3 py-2 rounded transition ${
                          selectedGuide.id === guide.id
                            ? 'bg-primary text-white'
                            : 'hover:bg-bg-secondary'
                        }`}
                      >
                        {guide.title}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Card>
              <div className="mb-4">
                <span className="text-sm text-primary font-medium">{selectedGuide.category}</span>
                <h2 className="text-2xl font-bold mt-1">{selectedGuide.title}</h2>
              </div>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-text-primary leading-relaxed">
                  {selectedGuide.content}
                </div>
              </div>
            </Card>

            <Card className="mt-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold mb-2">Need More Help?</h3>
              <p className="text-sm text-text-secondary mb-4">
                Can't find what you're looking for? We're here to help!
              </p>
              <Button variant="primary" size="sm">
                Contact Support
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
