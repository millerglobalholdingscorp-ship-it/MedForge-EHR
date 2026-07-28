import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth, useClerk } from '@clerk/clerk-react';

export default function Layout() {
  const location = useLocation();
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useClerk();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-teal-400 font-bold text-xl tracking-tight">
                MedForge
              </span>
              <span className="text-gray-400 text-sm font-medium">EHR</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                to="/"
                className={`text-sm transition-colors ${
                  location.pathname === '/'
                    ? 'text-teal-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Home
              </Link>
              {isLoaded && isSignedIn && (
                <Link
                  to="/dashboard"
                  className={`text-sm transition-colors ${
                    location.pathname === '/dashboard'
                      ? 'text-teal-400'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Dashboard
                </Link>
              )}
              {isLoaded && isSignedIn ? (
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/sign-in"
                  className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} MedForge EHR. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
