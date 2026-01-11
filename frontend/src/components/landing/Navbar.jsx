import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold text-neutral-900">
          NanoReach
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
            Features
          </a>
          <a href="#creators" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
            For Creators
          </a>
          <a href="#" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/auth/login"
            className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/auth/signup"
            className="px-4 py-2 bg-neutral-900 text-white text-sm rounded-full hover:bg-neutral-800 transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}
