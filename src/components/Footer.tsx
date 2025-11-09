import { Instagram } from 'lucide-react';
export const Footer = () => {
  return <footer className="border-t bg-muted/50 mt-20">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">WatchZone</h3>
            <p className="font-body text-sm text-muted-foreground">
              Your premier destination for luxury timepieces from the world's finest watchmakers.
            </p>
          </div>
          
          <div>
            <h4 className="font-body font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 font-body text-sm">
              <li><a href="/" className="text-muted-foreground hover:text-accent transition-colors">Home</a></li>
              <li><a href="/" className="text-muted-foreground hover:text-accent transition-colors">Shop</a></li>
              <li><a href="/" className="text-muted-foreground hover:text-accent transition-colors">About Us</a></li>
              <li><a href="/" className="text-muted-foreground hover:text-accent transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-body font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 font-body text-sm">
              <li><a href="/" className="text-muted-foreground hover:text-accent transition-colors">Shipping Info</a></li>
              <li><a href="/" className="text-muted-foreground hover:text-accent transition-colors">Returns</a></li>
              <li><a href="/" className="text-muted-foreground hover:text-accent transition-colors">Privacy Policy</a></li>
              <li><a href="/" className="text-muted-foreground hover:text-accent transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-body font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a 
                href="https://www.tiktok.com/@crown_time01?_r=1&_t=ZM-91FeXA4IOPQ" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/watchzoneua?igsh=MW9td3ZzaXd2cWlldw%3D%3D&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center font-body text-sm text-muted-foreground">© 2025 WatchZone. All rights reserved.</div>
      </div>
    </footer>;
};