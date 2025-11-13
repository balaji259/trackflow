"use client";
import { useState, useEffect } from "react";
import {
  Shield,
  Menu,
  X,
  Building2,
  ChevronDown,
  Users,
  Settings,
  LayoutGrid
} from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser
} from '@clerk/nextjs';
import Link from 'next/link';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  
  const { user } = useUser();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.org-dropdown')) {
        setIsOrgDropdownOpen(false);
      }
    };

    if (isOrgDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOrgDropdownOpen]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrollY > 50 
        ? 'bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-lg' 
        : 'bg-white/80 backdrop-blur-sm shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">flowtrack</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Show navigation links for non-authenticated users */}
            <SignedOut>
              <a href="#features" className="text-slate-700 hover:text-slate-900 transition-colors duration-200 font-medium">Features</a>
              <a href="#pricing" className="text-slate-700 hover:text-slate-900 transition-colors duration-200 font-medium">Pricing</a>
              <a href="#testimonials" className="text-slate-700 hover:text-slate-900 transition-colors duration-200 font-medium">Testimonials</a>
            </SignedOut>

            {/* Show Organizations dropdown for logged-in users */}
            <SignedIn>
              <div className="relative org-dropdown">
                <button
                  onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                  className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 transition-colors duration-200 font-medium"
                >
                  <Building2 className="w-5 h-5" />
                  <span>Organizations</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOrgDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOrgDropdownOpen && (
                  <div className="absolute top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2">
                    <Link
                      href="/organizations"
                      onClick={() => setIsOrgDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2.5 text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <LayoutGrid className="w-5 h-5" />
                      <div>
                        <div className="font-medium">All Organizations</div>
                        <div className="text-xs text-slate-500">View and manage</div>
                      </div>
                    </Link>

                    <div className="border-t border-slate-200 my-2"></div>

                    {/* Future options - currently disabled/grayed out */}
                    <div className="px-4 py-1 text-xs font-semibold text-slate-400 uppercase">
                      Coming Soon
                    </div>
                    
                    <button
                      disabled
                      className="flex items-center space-x-3 px-4 py-2.5 text-slate-400 cursor-not-allowed w-full"
                    >
                      <Users className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">Team Members</div>
                        <div className="text-xs text-slate-400">Invite & manage</div>
                      </div>
                    </button>

                    <button
                      disabled
                      className="flex items-center space-x-3 px-4 py-2.5 text-slate-400 cursor-not-allowed w-full"
                    >
                      <Settings className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">Organization Settings</div>
                        <div className="text-xs text-slate-400">Configure preferences</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </SignedIn>

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
              <UserButton afterSignOutUrl="/" />
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
              <SignedOut>
                <a href="#features" className="block text-slate-700 hover:text-slate-900 transition-colors duration-200 font-medium">Features</a>
                <a href="#pricing" className="block text-slate-700 hover:text-slate-900 transition-colors duration-200 font-medium">Pricing</a>
                <a href="#testimonials" className="block text-slate-700 hover:text-slate-900 transition-colors duration-200 font-medium">Testimonials</a>
              </SignedOut>
              
              {/* Mobile Organizations Menu */}
              <SignedIn>
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase">
                    Organizations
                  </div>
                  
                  <Link
                    href="/organizations"
                    className="flex items-center space-x-3 text-slate-700 hover:text-slate-900 transition-colors duration-200"
                  >
                    <LayoutGrid className="w-5 h-5" />
                    <div>
                      <div className="font-medium">All Organizations</div>
                      <div className="text-xs text-slate-500">View and manage</div>
                    </div>
                  </Link>

                  <div className="border-t border-slate-200 my-2"></div>
                  
                  <div className="text-xs font-semibold text-slate-400 uppercase">
                    Coming Soon
                  </div>

                  <div className="flex items-center space-x-3 text-slate-400">
                    <Users className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Team Members</div>
                      <div className="text-xs">Invite & manage</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-slate-400">
                    <Settings className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Organization Settings</div>
                      <div className="text-xs">Configure preferences</div>
                    </div>
                  </div>
                </div>
              </SignedIn>

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
                <div className="pt-4 border-t border-slate-200">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
