/**
 * Landing Page
 *
 * The main entry point of the application.
 * Shows hero section and call-to-action.
 */

import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.4]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e2e8f0 1px, transparent 1px),
            linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-[#e2e8f0] bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight text-[#0066FF]">
              Zyntel Feedback
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-24 sm:px-6 sm:pt-24 sm:pb-32 lg:px-8">
        <div className="text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-[#0066FF]">
            Feedback forms, simplified
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[#0f172a] sm:text-5xl md:text-6xl">
            Collect feedback.
            <br />
            <span className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] bg-clip-text text-transparent">
              Build better products.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#64748b] sm:text-xl">
            Create and share beautiful forms in seconds. Get real-time responses and insights with our analytics dashboard—no design skills needed.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="primary">
                Start for free →
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="ghost">
                Sign in
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-24 grid gap-6 sm:grid-cols-3 sm:gap-8">
          <div className="group rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition hover:border-[#cbd5e1] hover:shadow-md">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eff6ff] text-[#0066FF] transition group-hover:bg-[#0066FF] group-hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#0f172a]">Lightning fast</h3>
            <p className="mt-2 text-[#64748b]">
              Create and deploy forms in seconds with our simple builder—no coding required.
            </p>
          </div>
          <div className="group rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition hover:border-[#cbd5e1] hover:shadow-md">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eff6ff] text-[#0066FF] transition group-hover:bg-[#0066FF] group-hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#0f172a]">Powerful analytics</h3>
            <p className="mt-2 text-[#64748b]">
              See responses in real time with charts, trends, and export options.
            </p>
          </div>
          <div className="group rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition hover:border-[#cbd5e1] hover:shadow-md">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eff6ff] text-[#0066FF] transition group-hover:bg-[#0066FF] group-hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#0f172a]">Clean & professional</h3>
            <p className="mt-2 text-[#64748b]">
              Forms that look great on any device and reflect your brand.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 rounded-2xl border border-[#e2e8f0] bg-white p-8 text-center shadow-sm sm:p-10">
          <h2 className="text-2xl font-semibold text-[#0f172a] sm:text-3xl">
            Ready to gather feedback?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[#64748b]">
            Create your first form in under a minute. No credit card required.
          </p>
          <Link href="/register" className="mt-6 inline-block">
            <Button size="lg" variant="primary">
              Get started free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
