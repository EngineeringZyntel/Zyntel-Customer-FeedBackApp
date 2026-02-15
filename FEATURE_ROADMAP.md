# Zyntel Feedback - Feature Roadmap

## Implementation Plan (Basic, Professional, Scalable)

### Phase 1: Database & Core Infrastructure (Priority 1)
- [x] Schema updates for new features
- [ ] Soft delete (trash) functionality
- [ ] Form customization options
- [ ] User settings table
- [ ] Email notification system
- [ ] Form versioning

### Phase 2: UI Enhancements (Priority 2)
- [ ] Trash page (soft-deleted forms)
- [ ] Templates page with industry-specific templates
- [ ] Form settings page
- [ ] Account settings page
- [ ] Tabular responses view
- [ ] Form customization panel

### Phase 3: Advanced Features (Priority 3)
- [ ] Help center with guides
- [ ] Custom domain support (optional)
- [ ] Email notifications on form submission
- [ ] Version comparison UI

---

## Feature Details

### 1. Trash / Soft Delete
- Forms marked as deleted but not permanently removed
- Restore option within 30 days
- Auto-purge after 30 days

### 2. Industry Templates
- **Healthcare**: Patient Feedback, Appointment Satisfaction, Medical Survey
- **Events**: Event Feedback, Registration Form, Post-Event Survey
- **General**: Customer Feedback, Contact Form, NPS

### 3. Per-Form Settings
- Notifications (email on submission)
- Custom domain/subdomain
- Branding (colors, logo, fonts)
- Response limits & close dates (already done)

### 4. Global Account Settings
- Profile (name, email, password)
- Notification preferences
- Default branding
- API keys (future)

### 5. Help Center
- Getting started guide
- Form builder tutorials
- Best practices
- FAQ

### 6. Email Notifications
- SMTP configuration in settings
- Per-form toggle
- Email template system

### 7. Custom Domain
- Optional field in form settings
- Subdomain support (e.g., feedback.yourdomain.com)
- Instructions for DNS setup

### 8. Tabular Responses
- Table view: columns = questions, rows = respondents
- Export to CSV/Excel
- Filtering & sorting

### 9. Form Customization
- Background color
- Font selection
- Logo upload
- Form shape (rounded corners, shadows)
- Button styles

### 10. Version Tracking
- Save form versions on edit
- Compare versions
- Restore previous version
- Track who made changes

---

## Technical Approach

### Database Strategy
- Use JSON fields for flexible customization
- Soft delete with `deletedAt` timestamp
- Separate `FormVersion` table for history
- `UserSettings` table for preferences

### API Design
- RESTful endpoints
- Versioned API (`/api/v1/...`)
- Consistent error handling
- Rate limiting (future)

### UI/UX Principles
- Progressive disclosure (advanced features hidden by default)
- Consistent design system
- Mobile-responsive
- Accessible (ARIA labels)

### Scalability
- Modular code structure
- Feature flags for gradual rollout
- Database indexing for performance
- Caching strategy (Redis, future)

---

## Priority Order

1. **Immediate** (This sprint)
   - Trash functionality
   - Form customization basics
   - Templates page
   - Tabular responses

2. **Next** (Next sprint)
   - Account settings
   - Email notifications
   - Help center
   - Form settings page

3. **Future** (Backlog)
   - Custom domains
   - Version tracking
   - Advanced customization
   - API for integrations
