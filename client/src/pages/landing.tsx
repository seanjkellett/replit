import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, MessageCircle, Users, Shield, Zap, Globe } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Village</h1>
          </div>
          <Link href="/login">
            <Button variant="outline" data-testid="button-login-header">
              Sign In
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4" data-testid="badge-new-feature">
            🎉 Now Available - Modern Mattermost Interface
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-hero-title">
            Connect with Your Team Like Never Before
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto" data-testid="text-hero-description">
            Village brings your Mattermost conversations to life with a clean, modern interface designed for seamless team communication and collaboration.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="px-8 py-3" data-testid="button-get-started">
                Get Started
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3" data-testid="button-learn-more">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4" data-testid="text-features-title">
            Why Choose Village?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto" data-testid="text-features-description">
            Experience the power of Mattermost with a modern, intuitive interface that makes team communication effortless.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-colors" data-testid="card-feature-modern">
            <CardHeader>
              <MessageCircle className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              <CardTitle>Modern Chat Experience</CardTitle>
              <CardDescription>
                Clean, responsive design that makes conversations flow naturally with real-time message updates.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-colors" data-testid="card-feature-seamless">
            <CardHeader>
              <Users className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
              <CardTitle>Seamless Integration</CardTitle>
              <CardDescription>
                Connect directly to your existing Mattermost server with your current credentials - no setup required.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-colors" data-testid="card-feature-secure">
            <CardHeader>
              <Shield className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your data stays on your Mattermost server. We only provide the interface - your privacy is protected.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-colors" data-testid="card-feature-fast">
            <CardHeader>
              <Zap className="h-12 w-12 text-yellow-600 dark:text-yellow-400 mb-4" />
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Optimized for speed with efficient polling and caching - get your messages instantly without lag.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-colors" data-testid="card-feature-mobile">
            <CardHeader>
              <Globe className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mb-4" />
              <CardTitle>Cross-Platform</CardTitle>
              <CardDescription>
                Works perfectly on desktop, tablet, and mobile. Stay connected with your team from anywhere.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-colors" data-testid="card-feature-familiar">
            <CardHeader>
              <Home className="h-12 w-12 text-red-600 dark:text-red-400 mb-4" />
              <CardTitle>Familiar & Intuitive</CardTitle>
              <CardDescription>
                If you've used modern chat apps, you'll feel right at home. No learning curve, just better conversations.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4" data-testid="text-how-it-works-title">
              How It Works
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto" data-testid="text-how-it-works-description">
              Get started with Village in just a few simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center" data-testid="step-1">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sign In</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Use your existing Mattermost credentials to connect to your server.
              </p>
            </div>

            <div className="text-center" data-testid="step-2">
              <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Connect</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Village automatically syncs with your conversations and contacts.
              </p>
            </div>

            <div className="text-center" data-testid="step-3">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Chat</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Enjoy a beautiful, modern chat experience with all your team members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4" data-testid="text-cta-title">
            Ready to Transform Your Team Communication?
          </h2>
          <p className="text-xl mb-8 opacity-90" data-testid="text-cta-description">
            Join teams already using Village to make their Mattermost experience better.
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="px-8 py-3" data-testid="button-start-chatting">
              Start Chatting Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Home className="h-6 w-6 text-blue-400" />
            <span className="text-lg font-semibold" data-testid="text-footer-brand">Village</span>
          </div>
          <p className="text-gray-400" data-testid="text-footer-tagline">
            A modern interface for Mattermost. Built for teams who value great communication.
          </p>
        </div>
      </footer>
    </div>
  );
}