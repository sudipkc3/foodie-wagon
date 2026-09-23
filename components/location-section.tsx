import { MapPin, Clock, Calendar } from "iconoir-react"

export function LocationSection() {
  return (
    <section id="location" className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Truck Icon */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img
              src="/graphics/truck.svg"
              alt="Food Truck"
              className="h-16 w-16 object-contain"
            />
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary tracking-tight">STANDORT</h2>
            <img
              src="/graphics/truck.svg"
              alt="Food Truck"
              className="h-16 w-16 object-contain transform scale-x-[-1]"
            />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Finden Sie uns jeden Samstag am Saturn/Mediamarkt in Ingolstadt
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Map Placeholder */}
          <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden bg-secondary">
            <img src="/map-of-ingolstadt-germany-westpark-area-street-map.jpg" alt="Standort Karte" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-background/40" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-accent/30 rounded-full animate-ping" />
                <div className="relative w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-accent-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className="space-y-8">
            {/* Main Location Card */}
            <div className="p-8 bg-card border border-border rounded-2xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Hauptstandort</h3>
                  <p className="text-lg text-muted-foreground">
                    Saturn/Mediamarkt
                    <br />
                    Am Westpark 7<br />
                    85057 Ingolstadt
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Jeden Samstag!</h3>
                  <p className="text-muted-foreground">Besuchen Sie uns wöchentlich für frische Burger und mehr</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Öffnungszeiten</h3>
                  <p className="text-muted-foreground">Samstag: 11:00 - 20:00 Uhr</p>
                </div>
              </div>
            </div>

            {/* Events Banner */}
            <div className="p-6 bg-primary/10 border border-primary/30 rounded-xl">
              <h4 className="text-xl font-bold text-primary mb-2">Partys, Veranstaltungen & Festivals</h4>
              <p className="text-foreground">
                Wir cateren auch für Ihre privaten Events! Kontaktieren Sie uns für individuelle Angebote.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
