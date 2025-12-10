"use client"

import Link from 'next/link'
import { ArrowRight, Users, Zap, Shield, Star, Play, Check, Globe, Sparkles, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Navigation */}
      <nav className="sticky top-10 z-50 mx-28 lg:mx-48 xl:mx-59 rounded-2xl border border-white/10 bg-[#111111]/60 backdrop-blur-lg">
        <div className="mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CollabSpace</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="#about" className="text-gray-300 hover:text-white transition-colors">
                About
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/sign-in">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects - Changed to darker/black tones */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-gray-800 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-gray-700 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="text-center">
            {/* Badge */}
            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Sparkles className="mr-1 h-3 w-3" />
              Real-time collaboration platform
            </Badge>

            {/* Main Heading */}
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Team collaboration
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                made simple
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300 sm:text-xl">
              Transform how your team works together with real-time Kanban boards, 
              instant messaging, and seamless project management. No setup required.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 text-lg px-8 py-3">
                  Start collaborating free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-3"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.9/5 rating</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>10,000+ teams</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>50+ countries</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-20 relative">
            <div className="rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 p-2 shadow-2xl">
              <div className="rounded bg-[#111111] overflow-hidden aspect-video">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/6SbC2MbFdcc"
                  title="CollabSpace Interactive Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 bg-[#111111]/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Everything your team needs
            </h2>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
              Powerful features designed to make collaboration effortless
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="bg-[#111111]/30 border-white/10 backdrop-blur-sm hover:bg-[#111111]/50 transition-all duration-200">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-300">
                        <Check className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
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
      <section className="relative py-24 bg-[#111111]/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
              Get started in minutes with our simple, intuitive workflow
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Sign up',
                description: 'Create your account in seconds. No credit card required.',
                icon: Users,
              },
              {
                step: '02',
                title: 'Create workspace',
                description: 'Set up your team workspace and invite members instantly.',
                icon: Zap,
              },
              {
                step: '03',
                title: 'Start collaborating',
                description: 'Begin managing projects with real-time Kanban boards.',
                icon: Sparkles,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <Card className="bg-[#111111]/30 border-white/10 backdrop-blur-sm hover:bg-[#111111]/50 transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="text-4xl font-bold text-gray-400">{item.step}</div>
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-white">{item.title}</CardTitle>
                    <CardDescription className="text-gray-300">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
              Choose the plan that fits your team&apos;s needs
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`bg-[#111111]/30 border-white/10 backdrop-blur-sm hover:bg-[#111111]/50 transition-all duration-200 ${plan.featured ? 'border-blue-500/50 ring-2 ring-blue-500/20' : ''}`}>
                <CardHeader>
                  {plan.featured && (
                    <Badge className="w-fit mb-2 bg-blue-500/20 text-blue-300 border-blue-500/30">
                      Popular
                    </Badge>
                  )}
                  <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <CardDescription className="text-gray-300 mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-300">
                        <Check className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.featured ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' : 'bg-white/10 hover:bg-white/20'}`}
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
      <section className="relative py-24 bg-[#111111]/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Everything you need to know about CollabSpace
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="bg-[#111111]/30 border-white/10 backdrop-blur-sm hover:bg-[#111111]/50 transition-all duration-200 cursor-pointer"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-left">{faq.question}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                    >
                      {openFaq === index ? (
                        <Minus className="h-5 w-5" />
                      ) : (
                        <Plus className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                {openFaq === index && (
                  <CardContent>
                    <p className="text-gray-300">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to transform your team&apos;s workflow?
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Join thousands of teams already collaborating better with CollabSpace
          </p>
          
          <div className="mt-8">
            <Link href="/sign-up">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 text-lg px-12 py-4">
                Get started for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            No credit card required • Free forever plan • Setup in 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111111] border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Left Side - Branding */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">CollabSpace</span>
              </div>
              <p className="text-sm text-gray-400 max-w-sm">
                Real-time collaboration platform for teams. Manage projects, tasks, and communication all in one place.
              </p>
              <p className="text-xs text-gray-500">
                © 2025 CollabSpace. All rights reserved.
              </p>
            </div>

            {/* Right Side - Navigation Links */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Roadmap</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Getting Started</Link></li>
                <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">API Documentation</Link></li>
                <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link href="#about" className="text-sm text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
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
    gradient: 'from-blue-500 to-cyan-500',
    benefits: [
      'Visual task tracking',
      'Custom workflows', 
      'Real-time synchronization',
      'Mobile responsive'
    ]
  },
  {
    title: 'Team Collaboration',
    description: 'Work together seamlessly with live cursors, comments, and notifications.',
    icon: Users,
    gradient: 'from-purple-500 to-pink-500',
    benefits: [
      'Live presence indicators',
      'Real-time commenting',
      'Team activity feeds',
      'Smart notifications'
    ]
  },
  {
    title: 'Enterprise Security',
    description: 'Bank-grade security with encryption, compliance, and access controls.',
    icon: Shield,
    gradient: 'from-green-500 to-emerald-500',
    benefits: [
      'End-to-end encryption',
      'Role-based permissions',
      'Audit logs',
      'SOC 2 compliance'
    ]
  },
]

const pricingPlans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for individuals and small teams getting started.',
    features: [
      'Up to 5 team members',
      '3 workspaces',
      'Basic Kanban boards',
      'Real-time collaboration',
      'Community support'
    ],
    buttonText: 'Get Started',
    featured: false,
  },
  {
    name: 'Pro',
    price: '20',
    description: 'For growing teams that need more power and features.',
    features: [
      'Unlimited team members',
      'Unlimited workspaces',
      'Advanced Kanban boards',
      'Priority support',
      'Custom integrations',
      'Advanced analytics',
      'API access'
    ],
    buttonText: 'Start Free Trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations with advanced security needs.',
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Custom SLA',
      'SSO & SAML',
      'Advanced security',
      'Compliance certifications',
      'Custom onboarding'
    ],
    buttonText: 'Contact Sales',
    featured: false,
  },
]

const faqs = [
  {
    question: 'Can I import existing projects?',
    answer: 'Yes! CollabSpace supports importing projects from popular tools like Trello, Asana, and Jira. You can also import CSV files or use our API to migrate your data seamlessly.',
  },
  {
    question: 'What analytics do you provide?',
    answer: 'We provide comprehensive analytics including team productivity metrics, project completion rates, task velocity, and custom reports. Pro and Enterprise plans include advanced analytics with detailed insights.',
  },
  {
    question: 'Is my data secure and private?',
    answer: 'Absolutely. We use end-to-end encryption, regular security audits, and comply with SOC 2, GDPR, and other industry standards. Your data is stored securely and never shared with third parties.',
  },
  {
    question: 'Can I use CollabSpace offline?',
    answer: 'Yes, our mobile apps support offline mode. You can view and edit tasks offline, and changes will sync automatically when you reconnect to the internet.',
  },
  {
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel your subscription at any time from your account settings. There are no cancellation fees, and you&apos;ll continue to have access until the end of your billing period.',
  },
  {
    question: 'Do you offer integrations?',
    answer: 'Yes! CollabSpace integrates with popular tools like Slack, GitHub, Google Drive, and many more. We also provide a robust API for custom integrations.',
  },
]
