// src/components/Layout.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-parea-light font-sans text-parea-dark">
      {/* NEW NAV DESIGN:
        Sticky navigation, slight shadow, crisp brand elements.
      */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo Group */}
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-parea-primary no-underline transition-opacity hover:opacity-80">
              {/* Visual Placeholder: Using emoji for now, 
                this is where the generated asset goes! 
              */}
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-parea-primary/10 text-2xl">
                🍷
              </div>
              <span className="tracking-tight">Parea</span>
            </Link>

            {/* Actions: Replaced standard link with a sleek profile button simulation */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLogout}
                className="text-sm font-semibold px-4 py-2 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Page Content: 
        Mobile-first padding (4), responsive expansion (6, 8)
      */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}