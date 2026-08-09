import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Headphones } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import client from '../api/client';

export default function Contact() {
  useDocumentTitle('Contact GodwinShop');
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: 'Question about an order', message: '' });
  const [sending, setSending] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in your name, email and message.');
      return;
    }
    setSending(true);
    try {
      await client.post('/contact', form);
      toast.success('Message received. Our team will get back to you shortly.');
      setForm({ name: '', email: '', subject: 'Question about an order', message: '' });
    } catch (err) {
      toast.error(err.message || 'Could not send your message. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Support"
        title="Contact GodwinShop"
        description="Questions about an order, a product or your account? Write to us — we reply fast."
      />

      <section className="container-page grid gap-10 py-14 lg:grid-cols-5 lg:gap-14">
        <div className="space-y-4 lg:col-span-2">
          {[
            { icon: Mail, label: 'Email support', value: 'support@godwinshop.com' },
            { icon: Phone, label: 'Phone', value: '+1 (555) 010-2030' },
            { icon: MapPin, label: 'Business hours', value: 'Mon–Sat, 8:00 am – 8:00 pm' }
          ].map((c) => (
            <div key={c.label} className="card flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <c.icon size={20} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">{c.label}</p>
                <p className="font-semibold text-white">{c.value}</p>
              </div>
            </div>
          ))}

          <div className="card border-accent/30 bg-accent/5 p-5">
            <div className="flex items-center gap-3">
              <Headphones size={20} className="text-accent" />
              <p className="font-semibold text-white">Average reply time</p>
            </div>
            <p className="mt-2 text-sm text-muted">
              Most messages are answered within one business hour during opening
              hours.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 sm:p-8 lg:col-span-3">
          <h2 className="text-lg font-bold text-white">Send us a message</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="label">Full name</label>
              <input id="contact-name" name="name" value={form.name} onChange={handleChange} className="input" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="contact-email" className="label">Email</label>
              <input id="contact-email" name="email" type="email" value={form.email} onChange={handleChange} className="input" placeholder="you@example.com" />
            </div>
          </div>
          <div className="mt-5">
            <label htmlFor="contact-subject" className="label">Subject</label>
            <select id="contact-subject" name="subject" value={form.subject} onChange={handleChange} className="input">
              <option value="Question about an order">Question about an order</option>
              <option value="Delivery date question">Delivery date question</option>
              <option value="Product question">Product question</option>
              <option value="Account & verification">Account &amp; verification</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="mt-5">
            <label htmlFor="contact-message" className="label">Message</label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              className="input resize-y"
              placeholder="Tell us how we can help…"
            />
          </div>
          <button type="submit" disabled={sending} className="btn-accent mt-6">
            <Send size={16} /> {sending ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </section>
    </div>
  );
}