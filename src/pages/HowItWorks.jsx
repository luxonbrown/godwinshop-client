import { Link } from 'react-router-dom';
import { UserPlus, ShieldCheck, Search, FileText, ShoppingCart, CheckCircle2, Bell, Truck, CalendarCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import VideoTutorial from '../components/VideoTutorial';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const STEPS = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Create an account',
    text: 'Sign up with your full name, email, phone number and a strong password.'
  },
  {
    icon: ShieldCheck,
    number: '02',
    title: 'Verify your account',
    text: 'Verify with the link we send (or the development link shown after sign-up) so you can place orders.'
  },
  {
    icon: Search,
    number: '03',
    title: 'Browse & search products',
    text: 'Explore the catalogue, filter by category and price, and search by name, description or SKU.'
  },
  {
    icon: ShoppingBag,
    number: '04',
    title: 'Open a product',
    text: 'Check price, discount, availability and full description before you decide.'
  },
  {
    icon: ShoppingCart,
    number: '05',
    title: 'Add it to your cart',
    text: 'Pick the quantity you need — we cap it at the available stock automatically.'
  },
  {
    icon: CheckCircle2,
    number: '06',
    title: 'Place an order',
    text: 'Confirm your delivery details on checkout and place the order in seconds.'
  },
  {
    icon: Bell,
    number: '07',
    title: 'Receive confirmation',
    text: 'You are notified right away — and so is our team, who start processing immediately.'
  },
  {
    icon: CalendarCheck,
    number: '08',
    title: 'Check the delivery date',
    text: 'Your expected delivery date is assigned by our team and shown on your order page.'
  },
  {
    icon: Truck,
    number: '09',
    title: 'Track order status',
    text: 'Follow the timeline: confirmed → processing → ready → out for delivery → delivered.'
  }
];

export default function HowItWorks() {
  useDocumentTitle('How GodwinShop Works');

  return (
    <div>
      <PageHeader
        eyebrow="Guide"
        title="How GodwinShop Works"
        description="Nine simple steps from a fresh account to a delivered order — with clarity at every stage."
      />

      <section className="container-page py-14">
        <VideoTutorial />
      </section>

      <section className="border-t border-divider bg-base-2">
        <div className="container-page py-16">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.number} className="card p-6 transition-colors hover:border-accent/40">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <s.icon size={22} />
                  </div>
                  <span className="text-2xl font-black text-base-2">{s.number}</span>
                </div>
                <h3 className="mt-4 font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14 text-center">
        <h2 className="text-2xl font-bold text-white">Ready when you are</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
          Create your account now, or explore products first — the platform is here for both.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/register" className="btn-accent">Create account</Link>
          <Link to="/products" className="btn-outline">Explore products</Link>
        </div>
      </section>
    </div>
  );
}
