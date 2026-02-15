/**
 * Landing Page – OpnForm-inspired layout with product-cover style hero
 * Clean, simple messaging: Build → Share → Get Results
 */

import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Subtle dot grid */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.5]"
        style={{
          backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-[#0066FF]"
          >
            Zyntel Feedback
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Create a form for FREE
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero + Product cover style */}
      <section className="mx-auto max-w-5xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Build beautiful forms in seconds
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
            Create beautiful forms and share them anywhere. It&apos;s super fast—you don&apos;t need to know how to code. Get started for free!
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button size="lg" variant="primary">
                Create a form for FREE
              </Button>
            </Link>
          </div>
        </div>

        {/* Product cover – form preview mockup */}
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/50">
            {/* Browser-style chrome */}
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              </div>
              <div className="ml-4 flex-1 rounded-md bg-white py-1.5 text-center text-xs text-slate-400 ring-1 ring-slate-200">
                zyntel.app/form/abc123
              </div>
            </div>
            {/* In-window form preview */}
            <div className="bg-gradient-to-b from-slate-50 to-white p-8 sm:p-10">
              <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800">
                  Quick feedback
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  How was your experience? (1–5)
                </p>
                <div className="mt-4 space-y-3">
                  <div className="h-10 rounded-lg border border-slate-200 bg-slate-50/50" />
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-9 w-9 rounded-lg border border-slate-200 bg-white"
                      />
                    ))}
                  </div>
                  <div className="h-10 w-24 rounded-lg bg-[#0066FF] opacity-90" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars – unlimited */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-slate-600">
          <span className="flex items-center gap-2 font-medium">
            <svg className="h-5 w-5 text-[#0066FF]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Unlimited forms
          </span>
          <span className="flex items-center gap-2 font-medium">
            <svg className="h-5 w-5 text-[#0066FF]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Unlimited fields
          </span>
          <span className="flex items-center gap-2 font-medium">
            <svg className="h-5 w-5 text-[#0066FF]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Unlimited responses
          </span>
        </div>
      </section>

      {/* How it works – 3 steps */}
      <section className="border-t border-slate-100 bg-slate-50/50 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            The easiest way to create forms
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-600">
            Need a contact form? Doing a survey? Create a form in 2 minutes and start receiving submissions.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#0066FF] text-white">
                <span className="text-lg font-bold">1</span>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Create</h3>
              <p className="mt-2 text-sm text-slate-600">
                Build a simple form in minutes. Multiple input types, no coding needed.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#0066FF] text-white">
                <span className="text-lg font-bold">2</span>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Share</h3>
              <p className="mt-2 text-sm text-slate-600">
                Your form has a unique link. Share it or embed the form on your website.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#0066FF] text-white">
                <span className="text-lg font-bold">3</span>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Get Results</h3>
              <p className="mt-2 text-sm text-slate-600">
                View submissions, export to CSV, and check form analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlights – OpnForm-style list */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            And many more features
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-600">
            Zyntel Feedback makes form building easy with powerful features.
          </p>
          <ul className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              'Embed anywhere',
              'Views & submissions analytics',
              'Export to CSV',
              'Share via link or QR code',
              'Multiple question types',
              'Clean, professional forms',
            ].map((label) => (
              <li
                key={label}
                className="flex items-center gap-2 text-slate-700"
              >
                <svg className="h-5 w-5 shrink-0 text-[#0066FF]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-100 bg-slate-50/50 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Take your forms to the next level
          </h2>
          <p className="mt-3 text-slate-600">
            Generous, unlimited free plan. No credit card required.
          </p>
          <Link href="/register" className="mt-6 inline-block">
            <Button size="lg" variant="primary">
              Create a form for FREE
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Zyntel Feedback. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link href="/help" className="text-slate-600 hover:text-slate-900">
              Help
            </Link>
            <Link href="/login" className="text-slate-600 hover:text-slate-900">
              Login
            </Link>
            <Link href="/register" className="text-slate-600 hover:text-slate-900">
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
