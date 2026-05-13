export const Footer = () => {
  return (
    <footer className="border-t bg-muted/50 mt-12 md:mt-20">
      <div className="container px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-display text-lg font-semibold mb-3 md:mb-4">CrownTime</h3>
            <p className="font-body text-xs text-muted-foreground">
              Ваш найкращий вибір годинників преміум класу від найкращих виробників світу.
            </p>
          </div>
          
          <div>
            <h4 className="font-body font-semibold mb-3 md:mb-4">Швидкі посилання</h4>
            <ul className="space-y-2 font-body text-sm">
              <li><a href="/" className="text-muted-foreground hover:text-accent transition-colors">Головна</a></li>
              <li><a href="/" className="text-muted-foreground hover:text-accent transition-colors">Магазин</a></li>
              <li><a href="/" className="text-muted-foreground hover:text-accent transition-colors">Про нас</a></li>
              <li><a href="/" className="text-muted-foreground hover:text-accent transition-colors">Контакти</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-body font-semibold mb-3 md:mb-4">Обслуговування</h4>
            <ul className="space-y-2 font-body text-sm">
              <li><a href="/" className="text-muted-foreground hover:text-accent transition-colors">Доставка</a></li>
              <li><a href="/" className="text-muted-foreground hover:text-accent transition-colors">Повернення</a></li>
              <li><a href="/" className="text-muted-foreground hover:text-accent transition-colors">Конфіденційність</a></li>
              <li><a href="/" className="text-muted-foreground hover:text-accent transition-colors">Умови</a></li>
            </ul>
          </div>
          
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-body font-semibold mb-3 md:mb-4">Слідкуйте за нами</h4>
            <div className="flex gap-4">
              <a 
                href="https://www.tiktok.com/@crown_time01?_r=1&_t=ZM-91FeXA4IOPQ" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors p-2 -m-2"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-6 md:mt-8 pt-6 md:pt-8 text-center font-body text-xs text-muted-foreground">
          © 2025 CrownTime. Всі права захищені.
        </div>
      </div>
    </footer>
  );
};