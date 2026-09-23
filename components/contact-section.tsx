import { Phone, Mail, MapPin, Instagram } from "iconoir-react"

export function ContactSection() {
  return (
    <section id="contact" className="py-20 md:py-32 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary tracking-tight mb-4">KONTAKT</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Haben Sie Fragen oder möchten Sie uns für ein Event buchen? Kontaktieren Sie uns!
          </p>
        </div>

        {/* Contact Cards - Centered Grid */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Phone Card */}
          <div className="p-8 bg-secondary rounded-2xl flex flex-col items-center text-center space-y-4 border-2 border-border hover:border-primary transition-colors">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Phone className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-2">Telefon</p>
              <a
                href="tel:+4917622245627"
                className="text-2xl md:text-3xl font-black text-primary hover:text-primary/80 transition-colors"
              >
                +49 176 22245627
              </a>
            </div>
            <p className="text-sm text-muted-foreground">Rufen Sie uns direkt an</p>
          </div>

          {/* Email Card */}
          <div className="p-8 bg-secondary rounded-2xl flex flex-col items-center text-center space-y-4 border-2 border-border hover:border-primary transition-colors">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-2">E-Mail</p>
              <a
                href="mailto:flavor.bytes.gmbh@gmail.com"
                className="text-lg md:text-xl font-bold text-primary hover:text-primary/80 transition-colors break-all"
              >
                flavor.bytes.gmbh@gmail.com
              </a>
            </div>
            <p className="text-sm text-muted-foreground">Schreiben Sie uns eine E-Mail</p>
          </div>

          {/* Instagram Card */}
          <div className="p-8 bg-secondary rounded-2xl flex flex-col items-center text-center space-y-4 border-2 border-border hover:border-primary transition-colors">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Instagram className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-2">Instagram</p>
              <a
                href="https://www.instagram.com/thefoodiewagon"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg md:text-xl font-bold text-primary hover:text-primary/80 transition-colors"
              >
                @thefoodiewagon
              </a>
            </div>
            <p className="text-sm text-muted-foreground">Folgen Sie uns auf Instagram</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="max-w-2xl mx-auto mt-12 p-8 bg-primary/10 rounded-2xl border-2 border-primary/30 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">Besuchen Sie uns</h3>
          </div>
          <p className="text-lg text-foreground mb-2">
            <strong className="text-primary">Jeden Samstag</strong> von 11:00 - 20:00 Uhr
          </p>
          <p className="text-muted-foreground">Am Westpark 7, 85057 Ingolstadt</p>
          <p className="text-sm text-muted-foreground mt-4">
            Ansprechpartner: <strong className="text-foreground">Sohaib</strong> (FlavorBytes GmbH)
          </p>
        </div>
      </div>
    </section>
  )
}
