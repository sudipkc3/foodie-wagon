import Link from "next/link"
import { Instagram, Phone, Mail, MapPin } from "iconoir-react"

export function Footer() {
  return (
    <footer className="py-12 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/graphics/fooiewagen logo.svg"
                alt="The Foodie Wagon"
                className="h-12 w-12 object-contain"
              />
              <div>
                <h3 className="text-primary font-bold text-lg tracking-wider uppercase">The Foodie Wagon</h3>
                <p className="text-muted-foreground text-xs tracking-widest">WHERE FLAVOR HITS THE ROAD</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-3">
              Premium Halal Street Food in Ingolstadt. Burger, Fried Chicken, Currywurst und mehr.
            </p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <img
                src="/graphics/truck.svg"
                alt="Food Truck"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xs font-medium">Mobile Food Truck Experience</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-foreground font-bold mb-4 tracking-wide">QUICK LINKS</h4>
            <nav className="space-y-2">
              <Link href="#menu" className="block text-muted-foreground hover:text-primary transition-colors">
                Speisekarte
              </Link>
              <Link href="#location" className="block text-muted-foreground hover:text-primary transition-colors">
                Standort
              </Link>
              <Link href="#contact" className="block text-muted-foreground hover:text-primary transition-colors">
                Kontakt
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-foreground font-bold mb-4 tracking-wide">KONTAKT</h4>
            <div className="space-y-3">
              <a
                href="tel:+4917622245627"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                +49 176 22245627
              </a>
              <a
                href="mailto:flavor.bytes.gmbh@gmail.com"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                flavor.bytes.gmbh@gmail.com
              </a>
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                Am Westpark 7, 85057 Ingolstadt
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
              <p>© {new Date().getFullYear()} FlavorBytes GmbH. Alle Rechte vorbehalten.</p>
              <span className="hidden md:inline">•</span>
              <Link href="/impressum" className="hover:text-primary transition-colors">
                Impressum
              </Link>
              <span>•</span>
              <Link href="/datenschutz" className="hover:text-primary transition-colors">
                Datenschutz
              </Link>
              <span>•</span>
              <Link href="/agb" className="hover:text-primary transition-colors">
                AGB
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <img
                src="/graphics/halal logo.svg"
                alt="100% Halal Certified"
                className="h-10 md:h-12 w-auto"
              />
              <a
                href="https://www.instagram.com/thefoodiewagon"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-foreground hover:text-primary hover:bg-secondary/80 transition-all"
                aria-label="Instagram - The Foodie Wagon"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
