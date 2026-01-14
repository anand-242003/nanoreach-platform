import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-red-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-neutral-900 tracking-tight">
          DRK<span className="text-red-600">/</span>MTTR
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
            className="text-sm text-neutral-700 hover:text-neutral-900 transition-colors font-medium"
          >
            Log in
          </Link>
          <Link
            to="/auth/signup"
            className="px-6 py-2.5 bg-red-600 text-white text-sm rounded-full hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-600/30"
          >
            Get a Demo
          </Link>
        </div>
      </div>
    </nav>
  );
}
