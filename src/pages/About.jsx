import { Link } from 'react-router-dom';
import { Globe, Clock, PhoneCall, PackageCheck, CalendarCheck, ShieldCheck, Headphones } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const WHY = [
  { icon: Globe, title: 'A marketplace built for today', text: 'Discover a curated catalogue of products across electronics, fashion, home, beauty and more — all in one place.' },
  { icon: Clock, title: 'Fast, honest ordering', text: 'Place your order in a couple of minutes. No surprise steps, no hidden anything.' },
  { icon: PackageCheck, title: 'Every order confirmed', text: 'You get a confirmation instantly, and every progress update lands straight in your notifications.' },
  { icon: CalendarCheck, title: 'A real expected delivery date', text: 'Our team assigns your expected delivery date and updates it the moment anything changes.' },
  { icon: ShieldCheck, title: 'Verified customers & admins', text: 'Accounts are verified, roles are enforced and sensitive actions are protected on the server.' },
  { icon: Headphones, title: 'Support that answers', text: 'Reach us anytime through Contact — we respond with the same care we put into every order.' }
];

export default function About() {
  useDocumentTitle('About GodwinShop');

  return (
    <div>
      <PageHeader
        eyebrow="About us"
        title="GodwinShop is a modern commercial platform"
        description="Part store, part operations team — we make ordering simple and delivery completely transparent."
      />

      <section className="container-page grid gap-12 py-16 lg:grid-cols-5 lg:gap-16">
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <img
              src="/uploads/placeholder.svg"
              alt="GodwinShop operations"
              className="h-56 w-full object-cover"
            />
            <div className="p-6">
              <h2 className="text-lg font-bold text-white">What is GodwinShop?</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                GodwinShop is a commercial e-commerce platform that connects
                customers with products they need — and keeps them informed
                from the moment an order is placed until the delivery arrives.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                It is built for businesses and customers who value clarity:
                verified accounts, real prices, real stock, real delivery dates
                and honest status tracking.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold text-white">How it works</h2>
          <ol className="mt-6 space-y-4">
            {[
              ['Create a verified account', 'Register with your name, email and phone, then verify to unlock ordering.'],
              ['Browse and choose', 'Search a clean catalogue. Open any product for details, price and stock.'],
              ['Order with confidence', 'Your cart, checkout and confirmation are handled by the platform — prices re-checked server-side.'],
              ['Track your delivery', 'Follow every status change and your expected delivery date, with notifications along the way.']
            ].map(([title, text], i) => (
              <li key={title} className="flex gap-4 rounded-xl border border-divider bg-surface p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-black text-black">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>

          <blockquote className="mt-8 rounded-xl border border-accent/30 bg-accent/5 p-5">
            <p className="text-sm italic leading-relaxed text-white">
              "Why should a customer wonder about their delivery? GodwinShop exists
              so that every order has a clear path and a promised date."
            </p>
            <footer className="mt-2 text-xs font-semibold uppercase tracking-wide text-accent">
              — The GodwinShop team
            </footer>
          </blockquote>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/products" className="btn-accent">Browse products</Link>
            <Link to="/how-it-works" className="btn-outline">Watch how it works</Link>
          </div>
        </div>
      </section>

      <section className="border-t border-divider bg-base-2">
        <div className="container-page grid gap-5 py-16 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map((w) => (
            <div key={w.title} className="card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <w.icon size={22} />
              </div>
              <h3 className="mt-4 font-semibold text-white">{w.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{w.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}