import { Link } from 'react-router-dom';
import { SiX, SiLinkedin, SiGithub } from 'react-icons/si';

export default function Footer() {
  return (
    <footer className="py-16 border-t border-neutral-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="text-xl font-bold text-neutral-900 mb-4 block tracking-tight">
              DRK<span className="text-neutral-400">/</span>MTTR
            </Link>
            <p className="text-sm text-neutral-500 max-w-xs leading-relaxed mb-6">
              The modern marketplace connecting brands with authentic nano-influencers.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-neutral-400 hover:text-neutral-600 transition-colors"><SiX className="h-5 w-5" /></a>
              <a href="#" className="text-neutral-400 hover:text-neutral-600 transition-colors"><SiLinkedin className="h-5 w-5" /></a>
              <a href="#" className="text-neutral-400 hover:text-neutral-600 transition-colors"><SiGithub className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Features</a></li>
              <li><a href="#creators" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">For Creators</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Pricing</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">About</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Privacy</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Terms</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-100 text-center">
          <p className="text-sm text-neutral-400">© 2026 DRK/MTTR. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
