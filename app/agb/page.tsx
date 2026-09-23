import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowLeft } from "iconoir-react"

export const metadata = {
  title: "AGB | The Foodie Wagon",
  description: "Allgemeine Geschäftsbedingungen von The Foodie Wagon - FlavorBytes GmbH",
}

export default function AGBPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Allgemeine Geschäftsbedingungen (AGB)
            </h1>
            <p className="text-muted-foreground">
              FlavorBytes GmbH - The Foodie Wagon
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary max-w-none space-y-8">

            {/* Section 1 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">§ 1 Geltungsbereich</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") gelten für alle Verträge zwischen
                  der FlavorBytes GmbH, handelnd als "The Foodie Wagon" (nachfolgend "Anbieter") und Kunden
                  (nachfolgend "Kunde") über die Lieferung von Speisen und Getränken.
                </p>
                <p>
                  (2) Abweichende Bedingungen des Kunden werden nicht anerkannt, es sei denn, der Anbieter
                  stimmt ihrer Geltung ausdrücklich schriftlich zu.
                </p>
                <p>
                  (3) Diese AGB gelten auch für zukünftige Geschäftsbeziehungen, selbst wenn sie nicht nochmals
                  ausdrücklich vereinbart werden.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">§ 2 Vertragsschluss</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  (1) Die Bestellung von Speisen und Getränken durch den Kunden am Food Truck stellt ein
                  verbindliches Angebot zum Abschluss eines Kaufvertrages dar.
                </p>
                <p>
                  (2) Der Vertrag kommt mit der Annahme der Bestellung durch den Anbieter zustande. Die Annahme
                  kann auch konkludent durch die Zubereitung und Übergabe der Speisen erfolgen.
                </p>
                <p>
                  (3) Bei telefonischen oder E-Mail-Bestellungen für Veranstaltungen und Catering kommt der
                  Vertrag mit der schriftlichen oder mündlichen Auftragsbestätigung durch den Anbieter zustande.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">§ 3 Preise und Zahlung</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  (1) Es gelten die am Tag der Bestellung ausgehängten bzw. mitgeteilten Preise. Alle Preise
                  verstehen sich in Euro (€) inklusive der gesetzlichen Mehrwertsteuer.
                </p>
                <p>
                  (2) Die Zahlung erfolgt grundsätzlich bar bei Abholung am Food Truck. Kartenzahlung wird
                  akzeptiert, sofern entsprechend ausgewiesen.
                </p>
                <p>
                  (3) Bei Catering-Aufträgen und Veranstaltungen können abweichende Zahlungsmodalitäten
                  vereinbart werden. In der Regel wird eine Anzahlung von 30% bei Auftragserteilung fällig.
                </p>
                <p>
                  (4) Der Anbieter behält sich das Recht vor, Preise jederzeit zu ändern. Bereits abgeschlossene
                  Verträge bleiben hiervon unberührt.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">§ 4 Leistungsumfang und Produktqualität</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  (1) Der Anbieter verpflichtet sich, alle Speisen frisch und nach bestem Wissen und Gewissen
                  unter Einhaltung aller lebensmittelrechtlichen Vorschriften zuzubereiten.
                </p>
                <p>
                  (2) Alle Fleischprodukte sind 100% Halal-zertifiziert. Die Zubereitung erfolgt gemäß den
                  Halal-Richtlinien.
                </p>
                <p>
                  (3) Abbildungen und Beschreibungen der Speisen können vom tatsächlichen Produkt in
                  nicht wesentlichen Punkten abweichen. Leichte Abweichungen in Größe, Farbe und Gestaltung
                  sind möglich und stellen keinen Mangel dar.
                </p>
                <p>
                  (4) Der Anbieter behält sich vor, bei Nichtverfügbarkeit einzelner Zutaten diese durch
                  gleichwertige Zutaten zu ersetzen, sofern dies die Qualität nicht beeinträchtigt.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">§ 5 Allergene und Unverträglichkeiten</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  (1) Informationen über Allergene und Inhaltsstoffe werden auf Anfrage zur Verfügung gestellt.
                  Der Kunde ist verpflichtet, sich bei Allergien oder Unverträglichkeiten vor der Bestellung
                  zu informieren.
                </p>
                <p>
                  (2) Der Anbieter übernimmt keine Haftung für allergische Reaktionen, wenn der Kunde sich
                  nicht vor der Bestellung über die Inhaltsstoffe informiert hat.
                </p>
                <p>
                  (3) Trotz größter Sorgfalt können Spuren von Allergenen in den Produkten enthalten sein.
                  Eine 100%ige Vermeidung von Kreuzkontaminationen kann nicht garantiert werden.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">§ 6 Öffnungszeiten und Standort</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  (1) Der Food Truck ist regulär jeden Samstag am angegebenen Standort (Am Westpark 7, 85057
                  Ingolstadt) von 11:00 bis 20:00 Uhr geöffnet.
                </p>
                <p>
                  (2) Der Anbieter behält sich vor, die Öffnungszeiten aufgrund von Wetterbedingungen,
                  Veranstaltungen oder aus betrieblichen Gründen zu ändern. Eine Ankündigung erfolgt nach
                  Möglichkeit rechtzeitig.
                </p>
                <p>
                  (3) Der Anbieter ist berechtigt, den Standort zu wechseln. Änderungen werden auf der
                  Website und über soziale Medien bekannt gegeben.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">§ 7 Catering und Veranstaltungen</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  (1) Für Catering-Aufträge und private Veranstaltungen gelten besondere Vereinbarungen, die
                  individuell getroffen werden.
                </p>
                <p>
                  (2) Catering-Anfragen müssen mindestens 7 Tage im Voraus gestellt werden. Eine Bestätigung
                  erfolgt nach Prüfung der Verfügbarkeit.
                </p>
                <p>
                  (3) Bei Stornierung von Catering-Aufträgen bis 72 Stunden vor dem Termin ist keine
                  Stornogebühr fällig. Bei späterer Stornierung können bis zu 50% des Auftragswertes als
                  Stornogebühr berechnet werden.
                </p>
                <p>
                  (4) Der Kunde ist verpflichtet, am Veranstaltungsort für ausreichend Strom- und
                  Wasseranschlüsse sowie eine geeignete Stellfläche zu sorgen.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">§ 8 Reklamationen und Gewährleistung</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  (1) Beanstandungen sind unverzüglich, spätestens jedoch innerhalb von 2 Stunden nach
                  Übergabe der Speisen, mitzuteilen.
                </p>
                <p>
                  (2) Bei berechtigten Beanstandungen wird der Anbieter nach eigener Wahl entweder Nachbesserung
                  leisten oder den Kaufpreis erstatten.
                </p>
                <p>
                  (3) Weitergehende Ansprüche, insbesondere auf Schadensersatz, sind ausgeschlossen, es sei
                  denn, dem Anbieter fällt Vorsatz oder grobe Fahrlässigkeit zur Last.
                </p>
                <p>
                  (4) Die Gewährleistung gilt nicht für Mängel, die durch unsachgemäße Behandlung oder
                  Lagerung nach Übergabe entstanden sind.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">§ 9 Haftung</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  (1) Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers
                  oder der Gesundheit sowie für Schäden, die auf einer vorsätzlichen oder grob fahrlässigen
                  Pflichtverletzung beruhen.
                </p>
                <p>
                  (2) Für leichte Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher
                  Vertragspflichten. In diesem Fall ist die Haftung auf den vorhersehbaren, vertragstypischen
                  Schaden begrenzt.
                </p>
                <p>
                  (3) Die Haftung nach dem Produkthaftungsgesetz bleibt unberührt.
                </p>
                <p>
                  (4) Soweit die Haftung des Anbieters ausgeschlossen oder beschränkt ist, gilt dies auch
                  für die persönliche Haftung der Angestellten, Vertreter und Erfüllungsgehilfen.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">§ 10 Datenschutz</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  (1) Der Anbieter verarbeitet personenbezogene Daten des Kunden zur Vertragsabwicklung und
                  -erfüllung gemäß den Bestimmungen der DSGVO.
                </p>
                <p>
                  (2) Weitere Informationen zum Datenschutz finden Sie in unserer{" "}
                  <Link href="/datenschutz" className="text-primary hover:underline">
                    Datenschutzerklärung
                  </Link>.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">§ 11 Schlussbestimmungen</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
                </p>
                <p>
                  (2) Sofern der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder
                  öffentlich-rechtliches Sondervermögen ist, ist Gerichtsstand für alle Streitigkeiten aus
                  diesem Vertrag Ingolstadt.
                </p>
                <p>
                  (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die
                  Wirksamkeit der übrigen Bestimmungen hiervon unberührt. Die unwirksame Bestimmung ist durch
                  eine wirksame zu ersetzen, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am
                  nächsten kommt.
                </p>
              </div>
            </section>

            {/* Contact for Questions */}
            <section className="bg-secondary/30 p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Fragen zu den AGB?</h2>
              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  Bei Fragen zu diesen Allgemeinen Geschäftsbedingungen können Sie uns gerne kontaktieren:
                </p>
                <div className="mt-4 space-y-1">
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
              </div>
            </section>

            {/* Additional Links */}
            <section className="bg-secondary/30 p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Weitere Informationen</h2>
              <div className="space-y-2">
                <Link
                  href="/impressum"
                  className="block text-primary hover:underline"
                >
                  → Impressum
                </Link>
                <Link
                  href="/datenschutz"
                  className="block text-primary hover:underline"
                >
                  → Datenschutzerklärung
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
