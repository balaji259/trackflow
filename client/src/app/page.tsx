"use client";
import { useState, useEffect } from "react";
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Calendar, 
  BarChart3, 
  Zap, 
  Shield, 
  Globe,
  Star,
  Play,
  ChevronDown,
  Target,
  Clock,
  TrendingUp
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Project Planning",
      description: "Create detailed project roadmaps with customizable workflows and milestone tracking."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Seamlessly coordinate with your team through real-time updates and communication tools."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Get deep insights into project performance with comprehensive reporting and analytics."
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Time Tracking",
      description: "Monitor time spent on tasks and projects to optimize team productivity and billing."
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Sprint Management",
      description: "Plan and execute agile sprints with powerful scrum and kanban board capabilities."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Performance Insights",
      description: "Track team velocity, burndown charts, and project health metrics in real-time."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager at TechCorp",
      content: "This tool has revolutionized how our team manages projects. The intuitive interface and powerful features make complex project coordination effortless.",
      avatar: "SC"
    },
    {
      name: "Michael Rodriguez",
      role: "Engineering Lead at StartupXYZ",
      content: "The best project management solution we've used. It scales perfectly from small teams to enterprise-level operations.",
      avatar: "MR"
    },
    {
      name: "Emily Watson",
      role: "Scrum Master at DevStudio",
      content: "Finally, a tool that gets agile development right. The sprint planning and tracking features are game-changing.",
      avatar: "EW"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-8 animate-fade-in-up">
              <Star className="w-4 h-4 mr-2" />
              Trusted by 10,000+ teams worldwide
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Project Management
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                Made Simple
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Streamline your workflow, collaborate seamlessly, and deliver projects on time with our powerful project management platform designed for modern teams.
            </p>

            {/* Hero Dashboard Preview */}
            <div className="relative max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8 transform hover:scale-105 transition-all duration-700">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-2xl">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                        <div className="w-full h-2 bg-blue-500/30 rounded mb-2"></div>
                        <div className="w-3/4 h-2 bg-blue-500/20 rounded"></div>
                      </div>
                      <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-lg p-4">
                        <div className="w-full h-2 bg-indigo-500/30 rounded mb-2"></div>
                        <div className="w-2/3 h-2 bg-indigo-500/20 rounded"></div>
                      </div>
                      <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                        <div className="w-full h-2 bg-purple-500/30 rounded mb-2"></div>
                        <div className="w-5/6 h-2 bg-purple-500/20 rounded"></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex-1 h-8 bg-slate-700 rounded"></div>
                      <div className="w-20 h-8 bg-blue-600 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Everything you need to manage projects
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From planning to execution, our comprehensive suite of tools helps you deliver successful projects every time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="text-white">
              <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Active Teams</div>
            </div>
            <div className="text-white">
              <div className="text-4xl md:text-5xl font-bold mb-2">50M+</div>
              <div className="text-blue-100">Tasks Completed</div>
            </div>
            <div className="text-white">
              <div className="text-4xl md:text-5xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
            <div className="text-white">
              <div className="text-4xl md:text-5xl font-bold mb-2">150+</div>
              <div className="text-blue-100">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">flowtrack</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                The complete project management solution for modern teams.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors duration-200">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2025 flowtrack. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                <Users className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                <Shield className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out both;
        }
      `}</style>
    </div>
  );
}
