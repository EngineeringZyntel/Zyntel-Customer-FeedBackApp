# Zyntel Feedback - Production-Grade Improvement Plan

## Executive Summary

This document details bugs, inconsistencies, and missing features in the Zyntel Feedback application. Each issue includes severity rating, explanation, and implementation guidance.

**Severity Levels:**
- 🔴 **Critical**: Breaks functionality or causes data loss
- 🟡 **High**: Major UX issues or inconsistencies
- 🟢 **Medium**: Minor issues or improvements
- 🔵 **Low**: Nice-to-have enhancements

**Implementation Status:**
- ✅ Implemented
- 🔲 Not yet implemented

---

## Part 1: UI Component Inconsistencies

### 1.1 Layout Block Type Rendering ✅ IMPLEMENTED

**Status:** Fixed in `app/form/[code]/page.tsx`

- **divider** → renders as `<hr>` with `border-t-2 border-gray-200 my-6`
- **title** → renders as `<h4>` with `text-lg font-bold` (Section Title)
- **label** → renders as `<p>` with `text-xs uppercase tracking-wide font-semibold text-gray-500`
- **paragraph** → distinctive block with `bg-gray-50 border-l-4 border-blue-200`
- **heading1/2/3** → correct semantic H2/H3/H4 with proper spacing

**Note:** Layout blocks are in `LayoutToolbar.tsx`, not FormCustomizationSidebar. FormCustomizationSidebar handles header, typography, colors, and style.

### 1.2 Heading Hierarchy ✅ IMPLEMENTED

Form already has H1 (form title in header). Layout headings use H2, H3, H4 with consistent sizing and spacing.

### 1.3 Paragraph Field ✅ IMPLEMENTED

Paragraph now has visual distinction: gray background, left border, rounded corners.

---

## Part 2: Form Builder Validation Bugs

### 2.1 Empty Options Array ✅ IMPLEMENTED

**Status:** Fixed in `app/dashboard/create/page.tsx` and `app/dashboard/forms/[id]/edit/page.tsx`

`updateField` now ensures select/checkbox/multiple fields always have at least two options; defaults to `['Option 1', 'Option 2']` when empty.

### 2.2 Rating vs Linear Scale 🔲 ENHANCEMENT

Both exist and are distinct:
- **Rating** → Visual stars (1–5 typical)
- **Linear Scale** → Numbered buttons (1–10 typical)

Optional enhancement: add `scaleLabels` (min/max) for linear scale.

### 2.3 No Field Reordering 🔲 NOT IMPLEMENTED

Add drag-and-drop with `@dnd-kit/core` and `@dnd-kit/sortable`.

---

## Part 3: Missing Features

### 3.1 Custom Domains 🔲 NOT IMPLEMENTED

Requires Prisma model, API, middleware, and DNS verification.

### 3.2 Real-time Email Notifications 🔲 NOT IMPLEMENTED

Current: TODO in `app/api/responses/route.ts`. Use Resend or similar.

### 3.3 Enhanced Analytics 🔲 NOT IMPLEMENTED

Add completion rates, NPS, time distribution, field dropoff analysis.

### 3.4 Project-Level & Global Settings 🔲 NOT IMPLEMENTED

Requires UserSettings and FormSettings models.

---

## Part 4: Code Quality

### 4.1 API Error Handling 🔲 NOT IMPLEMENTED

Add `lib/api-errors.ts` with `ApiError` and `handleApiError` for consistent responses.

### 4.2 Input Sanitization ✅ IMPLEMENTED

**Status:** `lib/sanitize.ts` + `isomorphic-dompurify`

`responseData` is sanitized before storage in `app/api/responses/route.ts`.

### 4.3 Rate Limiting 🔲 NOT IMPLEMENTED

Requires `@upstash/ratelimit` and Redis.

### 4.4 Prisma Query Optimization 🔲 NOT IMPLEMENTED

Use `$queryRaw` for aggregations instead of loading all responses.

---

## Part 5: Security

### 5.1 JWT Secret ✅ IMPLEMENTED

**Status:** `lib/auth.ts`

`getJwtSecret()` throws if `JWT_SECRET` is missing or equals the default placeholder.

### 5.2 CSRF Protection 🔲 NOT IMPLEMENTED

Add token generation in middleware and verification in responses API.

### 5.3 Password Requirements ✅ IMPLEMENTED

**Status:** `lib/validations.ts`

Register schema now requires: 8+ chars, uppercase, lowercase, number, special character.

---

## Part 6: Accessibility

### 6.1 ARIA Labels 🔲 PARTIAL

Radio/checkbox groups have `role="radiogroup"`. Consider adding `aria-labelledby` for screen readers.

### 6.2 Keyboard Navigation 🔲 NOT IMPLEMENTED

InsertBlockModal: focus trap, Escape to close.

---

## Part 7: Performance

### 7.1 Image Optimization 🔲 NOT IMPLEMENTED

Logos stored as base64; consider Sharp for compression.

### 7.2 Database Indexes 🔲 NOT IMPLEMENTED

Add indexes: `Form(userId, isDeleted)`, `Form(formCode)`, `Response(formId, submittedAt)`.

---

## Implementation Summary

**Completed (this session):**
- Layout block rendering (divider, title, label, headings, paragraph)
- Empty-options validation for select/checkbox/multiple
- Input sanitization for response data
- JWT secret enforcement
- Password strength requirements

**Remaining priorities:**
1. Rate limiting
2. Email notifications
3. CSRF protection
4. Field reordering (drag-and-drop)
5. Standardized API error handling
