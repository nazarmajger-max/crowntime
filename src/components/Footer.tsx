import { Logo } from '@/components/Logo';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

const payments = ['Visa', 'Mastercard', 'Apple Pay', 'Google Pay', 'Накладений платіж'];

export const Footer = () => {
  return (
    <footer className="bg-forest text-forest-foreground mt-24 md:mt-32">
      <div className="container px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo className="block text-2xl" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-forest-foreground/70">
              Оригінальні наручні годинники світових брендів. Тиха впевненість у кожній деталі.
            </p>
          </div>

          <nav className="md:col-span-2" aria-label="Магазин">
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Магазин</p>
            <ul className="mt-5 space-y-3 text-sm text-forest-foreground/80">
              <li><Link to="/" className="link-underline hover:text-forest-foreground">Головна</Link></li>
              <li><Link to="/products" className="link-underline hover:text-forest-foreground">Колекція</Link></li>
              <li><Link to="/favorites" className="link-underline hover:text-forest-foreground">Обране</Link></li>
              <li><Link to="/cart" className="link-underline hover:text-forest-foreground">Кошик</Link></li>
            </ul>
          </nav>

          <nav className="md:col-span-2" aria-label="Покупцям">
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Покупцям</p>
            <ul className="mt-5 space-y-3 text-sm text-forest-foreground/80">
              <li>Доставка по Україні</li>
              <li>Гарантія</li>
              <li>Повернення 14 днів</li>
              <li><Link to="/profile" className="link-underline hover:text-forest-foreground">Особистий кабінет</Link></li>
            </ul>
          </nav>

          <div className="md:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Контакти</p>
            <ul className="mt-5 space-y-3 text-sm text-forest-foreground/80">
              <li className="flex items-center gap-3"><Phone className="h-4 w-4" strokeWidth={1.25} /> +38 (000) 000-00-00</li>
              <li className="flex items-center gap-3"><Mail className="h-4 w-4" strokeWidth={1.25} /> hello@crowntime.ua</li>
              <li className="flex items-center gap-3"><MapPin className="h-4 w-4" strokeWidth={1.25} /> Україна</li>
              <li>
                <a
                  href="https://www.tiktok.com/@crown_time01?_r=1&_t=ZM-91FeXA4IOPQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 link-underline hover:text-forest-foreground"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  TikTok
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-forest-foreground/15 pt-8 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-2" aria-label="Способи оплати">
            {payments.map((p) => (
              <li key={p} className="border border-forest-foreground/25 px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] text-forest-foreground/80">
                {p}
              </li>
            ))}
          </ul>
          <p className="text-xs text-forest-foreground/60">© {new Date().getFullYear()} CrownTime. Всі права захищені.</p>
        </div>
      </div>
    </footer>
  );
};
