import { Facebook, Instagram, Twitter } from 'lucide-react';
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
              <a href="/" className="text-muted-foreground hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="/" className="text-muted-foreground hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="/" className="text-muted-foreground hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center font-body text-sm text-muted-foreground">
          © 2024 Chronos Elite. All rights reserved.
        </div>
      </div>
    </footer>;
};