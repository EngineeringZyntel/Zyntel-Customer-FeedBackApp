/**
 * Landing Page
 * 
 * The main entry point of the application
 * Shows hero section and call-to-action
 */

import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-secondary via-white to-bg-secondary">
      {/* Navigation */}
      <nav className="border-b border-border bg-bg-primary/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-primary">Zyntel Feedback</div>
            <div className="flex gap-4">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6">
            Collect Feedback.
            <br />
            <span className="text-primary">Build Better Products.</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Create beautiful forms in seconds. Get real-time responses and insights with our powerful analytics dashboard.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="primary">
                Start Free →
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="ghost">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-bg-primary p-6 rounded-xl border border-border">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-text-secondary">
              Create and deploy forms in seconds with our intuitive builder
            </p>
          </div>
          <div className="bg-bg-primary p-6 rounded-xl border border-border">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Powerful Analytics</h3>
            <p className="text-text-secondary">
              Get insights with real-time analytics and response tracking
            </p>
          </div>
          <div className="bg-bg-primary p-6 rounded-xl border border-border">
            <div className="text-3xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">Beautiful Design</h3>
            <p className="text-text-secondary">
              Professional forms that match your brand identity
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

