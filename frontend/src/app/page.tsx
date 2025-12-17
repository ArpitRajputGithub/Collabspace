"use client"

import Link from 'next/link'
import { ArrowRight, Users, Zap, Shield, Star, Check, Globe, Sparkles, Plus, Minus, FolderKanban, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { useTheme } from 'next-themes'

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const { theme, setTheme } = useTheme()
  
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground" style={{ fontFamily: "'Chillax', sans-serif" }}>
                CollabSpace
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="#faq" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                FAQ
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              
              <Link href="/sign-in">
                <Button variant="ghost" className="text-sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="text-sm bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 border border-border bg-card text-primary">
              <Sparkles className="mr-1.5 h-3 w-3" />
              Real-time collaboration platform
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl" style={{ fontFamily: "'Chillax', sans-serif" }}>
              Team collaboration
              <span className="block text-primary">
                made simple
              </span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground">
              Transform how your team works together with real-time Kanban boards, 
              instant messaging, and seamless project management.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button 
                  size="lg" 
                  className="text-white text-base px-8"
                  style={{ backgroundColor: '#123458' }}
                >
                  Start free trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              
              <Link href="#features">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-base px-8 border-border text-foreground"
                >
                  Learn more
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span>4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>10,000+ teams</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                <span>50+ countries</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="rounded-2xl border border-border p-2 shadow-xl bg-card">
              <div className="rounded-xl overflow-hidden aspect-video flex items-center justify-center bg-muted">
                <div className="text-center">
                  <FolderKanban className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium text-foreground">Dashboard Preview</p>
                  <p className="text-sm text-muted-foreground">Your collaborative workspace</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl" style={{ fontFamily: "'Chillax', sans-serif" }}>
              Everything your team needs
            </h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground">
              Powerful features designed to make collaboration effortless
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="border border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-primary">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-foreground">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center text-sm text-muted-foreground">
                        <Check className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl" style={{ fontFamily: "'Chillax', sans-serif" }}>
              How it works
            </h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground">
              Get started in minutes with our simple workflow
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Sign up', description: 'Create your account in seconds. No credit card required.', icon: Users },
              { step: '02', title: 'Create workspace', description: 'Set up your team workspace and invite members instantly.', icon: FolderKanban },
              { step: '03', title: 'Start collaborating', description: 'Begin managing projects with real-time Kanban boards.', icon: Sparkles },
            ].map((item, index) => (
              <Card key={index} className="border border-border text-center bg-card">
                <CardHeader>
                  <div className="text-4xl font-bold mb-4 text-muted-foreground/50" style={{ fontFamily: "'Chillax', sans-serif" }}>
                    {item.step}
                  </div>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary">
                    <item.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-foreground">{item.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl" style={{ fontFamily: "'Chillax', sans-serif" }}>
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground">
              Choose the plan that fits your team&apos;s needs
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`border border-border ${plan.featured ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  {plan.featured && (
                    <Badge className="w-fit mb-2 bg-primary text-primary-foreground">
                      Popular
                    </Badge>
                  )}
                  <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground" style={{ fontFamily: "'Chillax', sans-serif" }}>
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription className="text-muted-foreground mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-muted-foreground">
                        <Check className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.featured ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border-border text-foreground'}`}
                    variant={plan.featured ? 'default' : 'outline'}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl" style={{ fontFamily: "'Chillax', sans-serif" }}>
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to know about CollabSpace
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="border border-border cursor-pointer bg-card"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium text-left text-foreground">
                      {faq.question}
                    </CardTitle>
                    <Button variant="ghost" size="sm">
                      {openFaq === index ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardHeader>
                {openFaq === index && (
                  <CardContent className="pt-0 pb-4">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl" style={{ fontFamily: "'Chillax', sans-serif" }}>
            Ready to transform your team&apos;s workflow?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Join thousands of teams already collaborating better with CollabSpace
          </p>
          
          <div className="mt-8">
            <Link href="/sign-up">
              <Button size="lg" className="text-base px-10 bg-background text-foreground hover:bg-background/90">
                Get started for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm text-primary-foreground/70">
            No credit card required • Free forever plan • Setup in 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Branding */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground" style={{ fontFamily: "'Chillax', sans-serif" }}>
                  CollabSpace
                </span>
              </div>
              <p className="text-sm max-w-sm text-muted-foreground">
                Real-time collaboration platform for teams. Manage projects, tasks, and communication all in one place.
              </p>
              <p className="text-xs text-muted-foreground/70">
                © 2026 CollabSpace. All rights reserved.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-foreground">Product</h3>
              <ul className="space-y-3">
                <li><Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4 text-foreground">Resources</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Getting Started</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API Docs</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4 text-foreground">Company</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: 'Real-time Kanban Boards',
    description: 'Drag-and-drop task management with instant updates across all team members.',
    icon: Zap,
    benefits: ['Visual task tracking', 'Custom workflows', 'Real-time sync', 'Mobile responsive']
  },
  {
    title: 'Team Collaboration',
    description: 'Work together seamlessly with live cursors, comments, and notifications.',
    icon: Users,
    benefits: ['Live presence', 'Real-time comments', 'Activity feeds', 'Smart notifications']
  },
  {
    title: 'Enterprise Security',
    description: 'Bank-grade security with encryption, compliance, and access controls.',
    icon: Shield,
    benefits: ['End-to-end encryption', 'Role-based access', 'Audit logs', 'SOC 2 compliance']
  },
]

const pricingPlans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for individuals and small teams.',
    features: ['Up to 5 team members', '3 workspaces', 'Basic Kanban boards', 'Community support'],
    buttonText: 'Get Started',
    featured: false,
  },
  {
    name: 'Pro',
    price: '20',
    description: 'For growing teams that need more power.',
    features: ['Unlimited members', 'Unlimited workspaces', 'Advanced analytics', 'Priority support', 'API access'],
    buttonText: 'Start Free Trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations.',
    features: ['Everything in Pro', 'Dedicated support', 'Custom SLA', 'SSO & SAML', 'Advanced security'],
    buttonText: 'Contact Sales',
    featured: false,
  },
]

const faqs = [
  { question: 'Can I import existing projects?', answer: 'Yes! CollabSpace supports importing from Trello, Asana, Jira, and CSV files.' },
  { question: 'What analytics do you provide?', answer: 'Comprehensive analytics including productivity metrics, completion rates, and custom reports.' },
  { question: 'Is my data secure?', answer: 'We use end-to-end encryption and comply with SOC 2, GDPR, and other industry standards.' },
  { question: 'Can I use CollabSpace offline?', answer: 'Yes, our mobile apps support offline mode with automatic sync when reconnected.' },
  { question: 'Do you offer integrations?', answer: 'Yes! We integrate with Slack, GitHub, Google Drive, and provide a robust API.' },
]
