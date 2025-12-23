"use client";
import { useState, useEffect } from "react";
import {
  Shield,
  Menu,
  X,
  Kanban,
  Workflow
} from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import Link from "next/link";




export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrollY > 50 
        ? 'bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-lg' 
        : 'bg-white/80 backdrop-blur-sm shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              {/* <Shield className="w-6 h-6 text-white" /> */}
               <Kanban className="w-6 h-6 text-white" />
               {/* <Workflow className="w-6 h-6 text-white" /> */}

            </div>
            <span className="text-xl font-bold text-slate-800">trackflow</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">


         <Link
            href="/dashboard"
            className="text-slate-700 hover:text-slate-900 transition-colors duration-200 font-medium"
          >
            Dashboard
          </Link>
           

          <Link
            href="/organizations"
            className="text-slate-700 hover:text-slate-900 transition-colors duration-200 font-medium"
          >
            Organizations
          </Link>

           
            {/* <a href="#features" className="text-slate-700 hover:text-slate-900 transition-colors duration-200 font-medium">Features</a> */}
            {/* <a href="#pricing" className="text-slate-700 hover:text-slate-900 transition-colors duration-200 font-medium">Pricing</a> */}
            {/* <a href="#testimonials" className="text-slate-700 hover:text-slate-900 transition-colors duration-200 font-medium">Testimonials</a> */}

            <SignedOut>
              <SignInButton>
                <button className="text-slate-700 hover:text-slate-900 transition-colors duration-200 font-medium">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <a href="#features" className="block text-slate-700 hover:text-slate-900 transition-colors duration-200 font-medium">Features</a>
              <a href="#pricing" className="block text-slate-700 hover:text-slate-900 transition-colors duration-200 font-medium">Pricing</a>
              <a href="#testimonials" className="block text-slate-700 hover:text-slate-900 transition-colors duration-200 font-medium">Testimonials</a>
              <SignedOut>
                <SignInButton>
                  <button className="block w-full text-left text-slate-700 hover:text-slate-900 transition-colors duration-200 font-medium">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg text-center">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
