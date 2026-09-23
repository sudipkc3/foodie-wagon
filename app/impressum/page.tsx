import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowLeft } from "iconoir-react"

export const metadata = {
  title: "Impressum | The Foodie Wagon",
  description: "Rechtliche Informationen und Kontaktdaten von The Foodie Wagon - FlavorBytes GmbH",
}

export default function ImpressumPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Zurück zur Startseite</span>
          </Link>

          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Impressum</h1>
            <p className="text-muted-foreground">
              Angaben gemäß § 5 TMG (Telemediengesetz)
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary max-w-none space-y-8">

            {/* Company Information */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Angaben zum Unternehmen</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">Firmenname:</strong> FlavorBytes GmbH</p>
                <p><strong className="text-foreground">Geschäftsbezeichnung:</strong> The Foodie Wagon</p>
                <p><strong className="text-foreground">Rechtsform:</strong> Gesellschaft mit beschränkter Haftung (GmbH)</p>
              </div>
            </section>

            {/* Address */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Anschrift</h2>
              <div className="space-y-1 text-muted-foreground">
                <p>FlavorBytes GmbH</p>
                <p>Am Westpark 7</p>
                <p>85057 Ingolstadt</p>
                <p>Deutschland</p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Kontakt</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Telefon:</strong>{" "}
                  <a href="tel:+4917622245627" className="text-primary hover:underline">
                    +49 176 22245627
                  </a>
                </p>
                <p>
                  <strong className="text-foreground">E-Mail:</strong>{" "}
                  <a href="mailto:flavor.bytes.gmbh@gmail.com" className="text-primary hover:underline">
                    flavor.bytes.gmbh@gmail.com
                  </a>
                </p>
              </div>
            </section>

            {/* Representative */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Vertretungsberechtigter</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">Geschäftsführer:</strong> Sohaib</p>
                <p><strong className="text-foreground">Ansprechpartner:</strong> Sohaib</p>
              </div>
            </section>

            {/* Registration */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Registereintrag</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">Registergericht:</strong> Amtsgericht Ingolstadt</p>
                <p><strong className="text-foreground">Handelsregisternummer:</strong> HRB [Wird nachgetragen]</p>
              </div>
            </section>

            {/* Tax Information */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Umsatzsteuer-Identifikationsnummer</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong className="text-foreground">USt-IdNr.:</strong> DE [Wird nachgetragen]
                </p>
                <p className="text-sm">
                  Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz
                </p>
              </div>
            </section>

            {/* Food Business Registration */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Lebensmittelrechtliche Zulassung</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">Zuständige Behörde:</strong> Gesundheitsamt Ingolstadt</p>
                <p><strong className="text-foreground">Zertifizierung:</strong> 100% Halal zertifiziert</p>
                <p className="text-sm">
                  Registriert gemäß der Verordnung (EG) Nr. 852/2004 über Lebensmittelhygiene
                </p>
              </div>
            </section>

            {/* Liability Disclaimer */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Haftungsausschluss</h2>

              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Haftung für Inhalte</h3>
                  <p className="text-sm">
                    Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
                    Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
                    Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
                    nach den allgemeinen Gesetzen verantwortlich.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Haftung für Links</h3>
                  <p className="text-sm">
                    Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir
                    keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
                    Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
                    Anbieter oder Betreiber der Seiten verantwortlich.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Urheberrecht</h3>
                  <p className="text-sm">
                    Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
                    unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
                    Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
                    bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                  </p>
                </div>
              </div>
            </section>

            {/* Dispute Resolution */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Streitbeilegung</h2>
              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                  <a
                    href="https://ec.europa.eu/consumers/odr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline ml-1"
                  >
                    https://ec.europa.eu/consumers/odr/
                  </a>
                </p>
                <p>
                  Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                  Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </div>
            </section>

            {/* Additional Links */}
            <section className="bg-secondary/30 p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Weitere Informationen</h2>
              <div className="space-y-2">
                <Link
                  href="/datenschutz"
                  className="block text-primary hover:underline"
                >
                  → Datenschutzerklärung
                </Link>
                <Link
                  href="/agb"
                  className="block text-primary hover:underline"
                >
                  → Allgemeine Geschäftsbedingungen (AGB)
                </Link>
              </div>
            </section>

            {/* Last Updated */}
            <div className="text-sm text-muted-foreground text-center pt-8 border-t border-border">
              <p>Stand: Dezember 2025</p>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
