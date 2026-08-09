import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import logo from '../img/logo.png';

export default function Footer() {
  return (
    <footer className="border-t border-divider bg-base-2">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <img src={logo} alt="GodwinShop" className="h-9 w-auto rounded-full" />
            <span className="text-white">Godwin<span className="text-accent">Shop</span></span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Shop smarter, order easily, get it delivered. A modern marketplace for everything you need — with every order
            tracked until it reaches your door.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/products" className="text-muted transition-colors hover:text-accent">All Products</Link></li>
            <li><Link to="/categories" className="text-muted transition-colors hover:text-accent">Categories</Link></li>
            <li><Link to="/cart" className="text-muted transition-colors hover:text-accent">Your Cart</Link></li>
            <li><Link to="/orders" className="text-muted transition-colors hover:text-accent">Track an Order</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Company</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/about" className="text-muted transition-colors hover:text-accent">About GodwinShop</Link></li>
            <li><Link to="/how-it-works" className="text-muted transition-colors hover:text-accent">How It Works</Link></li>
            <li><Link to="/contact" className="text-muted transition-colors hover:text-accent">Contact</Link></li>
            <li><Link to="/register" className="text-muted transition-colors hover:text-accent">Create an Account</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li className="flex items-center gap-2"><Mail size={15} className="text-accent" /> support@godwinshop.com</li>
            <li className="flex items-center gap-2"><Phone size={15} className="text-accent" /> +1 (555) 010-2030</li>
            <li className="flex items-center gap-2"><MapPin size={15} className="text-accent" /> Market Plaza, Suite 12, Lagos</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-divider">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} GodwinShop. All rights reserved.</p>
          <p>Dark. White. Gold. Built for business.</p>
        </div>
      </div>
    </footer>
  );
}