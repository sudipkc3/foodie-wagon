import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowLeft } from "iconoir-react"

export const metadata = {
  title: "Datenschutzerklärung | The Foodie Wagon",
  description: "Datenschutzerklärung von The Foodie Wagon - Informationen zum Schutz Ihrer persönlichen Daten",
}

export default function DatenschutzPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Datenschutzerklärung</h1>
            <p className="text-muted-foreground">
              Informationen zum Schutz Ihrer persönlichen Daten gemäß DSGVO
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary max-w-none space-y-8">

            {/* Introduction */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Datenschutz auf einen Blick</h2>

              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Allgemeine Hinweise</h3>
                  <p className="text-sm">
                    Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen
                    Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit
                    denen Sie persönlich identifiziert werden können.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Datenerfassung auf dieser Website</h3>
                  <p className="text-sm mb-2">
                    <strong className="text-foreground">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong>
                  </p>
                  <p className="text-sm">
                    Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten
                    können Sie dem Impressum dieser Website entnehmen.
                  </p>
                </div>
              </div>
            </section>

            {/* Responsible Party */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Verantwortliche Stelle</h2>

              <div className="space-y-2 text-muted-foreground">
                <p className="text-sm">
                  Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
                </p>
                <div className="bg-secondary/30 p-4 rounded mt-2">
                  <p className="font-semibold text-foreground">FlavorBytes GmbH</p>
                  <p>Am Westpark 7</p>
                  <p>85057 Ingolstadt</p>
                  <p className="mt-2">
                    Telefon:{" "}
                    <a href="tel:+4917622245627" className="text-primary hover:underline">
                      +49 176 22245627
                    </a>
                  </p>
                  <p>
                    E-Mail:{" "}
                    <a href="mailto:flavor.bytes.gmbh@gmail.com" className="text-primary hover:underline">
                      flavor.bytes.gmbh@gmail.com
                    </a>
                  </p>
                </div>
                <p className="text-sm mt-4">
                  Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam
                  mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten entscheidet.
                </p>
              </div>
            </section>

            {/* Data Collection */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Datenerfassung</h2>

              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Wie erfassen wir Ihre Daten?</h3>
                  <p className="text-sm">
                    Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es
                    sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben.
                  </p>
                  <p className="text-sm mt-2">
                    Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch
                    unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser,
                    Betriebssystem oder Uhrzeit des Seitenaufrufs).
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Wofür nutzen wir Ihre Daten?</h3>
                  <p className="text-sm">
                    Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu
                    gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden,
                    jedoch nur mit Ihrer ausdrücklichen Zustimmung.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Welche Rechte haben Sie bezüglich Ihrer Daten?</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                    <li>Recht auf Auskunft über Ihre gespeicherten Daten</li>
                    <li>Recht auf Berichtigung unrichtiger Daten</li>
                    <li>Recht auf Löschung Ihrer Daten</li>
                    <li>Recht auf Einschränkung der Verarbeitung</li>
                    <li>Recht auf Datenübertragbarkeit</li>
                    <li>Recht auf Widerspruch gegen die Verarbeitung</li>
                    <li>Recht auf Beschwerde bei einer Aufsichtsbehörde</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Server Log Files */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Server-Log-Dateien</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten
                  Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Browsertyp und Browserversion</li>
                  <li>Verwendetes Betriebssystem</li>
                  <li>Referrer URL</li>
                  <li>Hostname des zugreifenden Rechners</li>
                  <li>Uhrzeit der Serveranfrage</li>
                  <li>IP-Adresse</li>
                </ul>
                <p className="mt-4">
                  Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die
                  Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Der
                  Websitebetreiber hat ein berechtigtes Interesse an der technisch fehlerfreien Darstellung
                  und der Optimierung seiner Website.
                </p>
              </div>
            </section>

            {/* Contact Forms */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Kontaktformular</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem
                  Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung
                  der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
                </p>
                <p className="mt-2">
                  Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Die Verarbeitung dieser Daten
                  erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung
                  eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist.
                </p>
                <p className="mt-2">
                  Die von Ihnen im Kontaktformular eingegebenen Daten verbleiben bei uns, bis Sie uns zur
                  Löschung auffordern, Ihre Einwilligung zur Speicherung widerrufen oder der Zweck für die
                  Datenspeicherung entfällt.
                </p>
              </div>
            </section>

            {/* Email/Phone */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Anfrage per E-Mail oder Telefon</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  Wenn Sie uns per E-Mail oder Telefon kontaktieren, wird Ihre Anfrage inklusive aller daraus
                  hervorgehenden personenbezogenen Daten (Name, Anfrage) zum Zwecke der Bearbeitung Ihres
                  Anliegens bei uns gespeichert und verarbeitet.
                </p>
                <p className="mt-2">
                  Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Die Verarbeitung dieser Daten
                  erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung
                  eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist.
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Cookies</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  Diese Website verwendet technisch notwendige Cookies. Dies sind kleine Textdateien, die auf
                  Ihrem Endgerät gespeichert werden und die der Browser speichert. Cookies richten auf Ihrem
                  Rechner keinen Schaden an und enthalten keine Viren.
                </p>
                <p className="mt-2">
                  Einige Cookies bleiben auf Ihrem Endgerät gespeichert bis Sie diese löschen. Sie ermöglichen
                  es uns, Ihren Browser beim nächsten Besuch wiederzuerkennen. Wenn Sie dies nicht wünschen,
                  so können Sie Ihren Browser so einrichten, dass er Sie über das Setzen von Cookies informiert
                  und Sie dies nur im Einzelfall erlauben.
                </p>
              </div>
            </section>

            {/* Data Security */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Datensicherheit</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  Wir verwenden innerhalb des Website-Besuchs das verbreitete SSL-Verfahren (Secure Socket Layer)
                  in Verbindung mit der jeweils höchsten Verschlüsselungsstufe, die von Ihrem Browser unterstützt
                  wird. In der Regel handelt es sich dabei um eine 256-Bit-Verschlüsselung.
                </p>
                <p className="mt-2">
                  Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per
                  E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff
                  durch Dritte ist nicht möglich.
                </p>
              </div>
            </section>

            {/* Retention Period */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">9. Speicherdauer</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde,
                  verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung
                  entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur
                  Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich
                  zulässigen Gründe für die Speicherung Ihrer personenbezogenen Daten haben.
                </p>
              </div>
            </section>

            {/* Your Rights */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">10. Ihre Rechte</h2>

              <div className="space-y-4 text-muted-foreground text-sm">
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Auskunftsrecht</h3>
                  <p>Sie haben das Recht, eine Bestätigung darüber zu verlangen, ob betreffende Daten verarbeitet werden.</p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Recht auf Berichtigung</h3>
                  <p>Sie haben das Recht, unverzüglich die Berichtigung unrichtiger Daten zu verlangen.</p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Recht auf Löschung</h3>
                  <p>Sie haben das Recht, die unverzügliche Löschung Ihrer Daten zu verlangen.</p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Recht auf Einschränkung der Verarbeitung</h3>
                  <p>Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer Daten zu verlangen.</p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Recht auf Datenübertragbarkeit</h3>
                  <p>Sie haben das Recht, Ihre Daten in einem strukturierten Format zu erhalten.</p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Widerspruchsrecht</h3>
                  <p>Sie haben das Recht, der Verarbeitung Ihrer Daten zu widersprechen.</p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Beschwerderecht</h3>
                  <p>
                    Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren. Die zuständige
                    Aufsichtsbehörde ist das Bayerische Landesamt für Datenschutzaufsicht.
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
