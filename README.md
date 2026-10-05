# Für Caro – Geburtstags-Überraschung (3. Dezember 2026)

Eine kleine statische Website: Caro öffnet mit einem Passwort die Seite, sieht einen
Countdown und die Aktivitäten des Tages als verschlossene Karten. Jede Karte hat ihr
eigenes Passwort (mit Rätsel-Tipp), klappt nach dem Entsperren wie eine Geburtstagskarte
auf und verrät alle Details. Den Vormittag darf Caro selbst wählen.

Reines HTML, CSS und JavaScript (ES-Module) – kein Framework, kein Build-Schritt,
keine Tracker, keine Cookies.

## Struktur

```
index.html            Seitengerüst (lädt Schriften, CSS und js/app.js)
data.js               ALLE Inhalte: Texte, Zeiten, Orte, Dresscode, Bilder, Passwort-Hashes
css/style.css         Gestaltung (Farben je Aktivität oben unter „Akzentfarben“)
js/app.js             Ablauf: Gate, Dashboard, Entsperren, Karte, Vormittags-Wahl, Resets
js/hash.js            Passwort-Normalisierung + SHA-256 (auch von den Tools genutzt)
js/icons.js           eigene Inline-SVG-Symbole
js/effects.js         Funkeln im Hintergrund, Konfetti
js/modal.js           Dialoge: Fokus-Falle, Escape, Rest der Seite inert
js/store.js           Speichern des Zustands im localStorage
images/*.jpg          Bilder der Aktivitäten (aktuell Platzhalter)
images/platzhalter/   SVG-Quellen der Platzhalter
tools/hash.mjs        Passwort → Hash (Kommandozeile)
tools/hash.html       Passwort → Hash (im Browser)
tests/                Playwright-Test, Lighthouse-Prüfung, Platzhalter-Generator
```

## Texte ändern

Alles steht in **`data.js`** – Texte einfach zwischen den Anführungszeichen ändern.

- `settings` – Name, Datum für den Countdown, `showTimeOnDashboard` (Startzeit auf
  gesperrten Kacheln zeigen: `true`/`false`), `storageKey`.
- `gate` – Texte des Startbildschirms, Tipp nach falscher Eingabe, Passwort-Hash.
- `dashboard`, `ui` – alle übrigen Texte (Begrüßung, Buttons, Rückfragen …).
- `activities` – das Programm in zeitlicher Reihenfolge. Jede Aktivität hat u. a.
  `title`, `tagline`, `start`/`end`, `place` (`name`, `address`, `mapsQuery`), `image`,
  `description` (Absätze mit `\n\n`), `wear`, `bring` (Liste), `note`, `hint` (Rätsel im
  Passwort-Dialog) und `passwordHash`.
- Die Vormittags-Wahl ist der Eintrag mit `type: "choice"`: ein gemeinsames Passwort,
  zwei `options` mit jeweils allen Details.
- Die Rätsel-Tipps (`hint`) erscheinen erst ab dem Geburtstag (`settings.birthday`),
  beim Frühstück schon einen Tag vorher (`hintFrom`). Vorher steht `ui.hintLocked`
  („Hinweise gibts erst an deinem großen Tag“). Mit `hintFrom` kannst du das Datum je
  Aktivität festlegen. Das Passwort funktioniert unabhängig davon jederzeit.
- Gesperrte Kacheln zeigen nur eine unscharfe Farbfläche statt des Symbols; das Symbol
  erscheint erst beim Entsperren (die Wahl-Kachel zeigt ihr Symbol von Anfang an).
- Ist `place.address` leer, gibt es keine Adresse und keinen Kartenlink (so beim Abendessen).
- `id` bitte nicht ändern – daran hängt der gespeicherte Entsperr-Zustand.

Nach dem Speichern die Seite neu laden. Beim Testen ggf. im Footer zurücksetzen (s. u.).

## Bilder ersetzen

Lege deine Fotos mit **genau diesen Namen** in `images/` ab (alte Datei überschreiben):

| Datei                         | Aktivität          |
| ----------------------------- | ------------------ |
| `images/fruehstueck.jpg`      | Frühstück          |
| `images/schnee.jpg`           | Schneespaziergang  |
| `images/weihnachtsmarkt.jpg`  | Weihnachtsmarkt    |
| `images/minigolf.jpg`         | Blacklight-Minigolf|
| `images/abendessen.jpg`       | Abendessen         |
| `images/therme.jpg`           | Therme             |

Tipps: Querformat 3:2, ca. 1200 × 800 px, unter ~300 KB (z. B. mit squoosh.app
verkleinern). Ein anderes Format/Name geht auch – dann in `data.js` den Pfad bei
`image` anpassen und `imageAlt` (Bildbeschreibung) mitändern. Fehlt eine Bilddatei,
zeigt die Karte automatisch einen Farbverlauf mit Symbol.
Keine fremden Bilder per Link einbinden – Datei herunterladen und lokal ablegen.

## Passwörter

Die Passwörter stehen **nicht im Klartext** in `data.js`, sondern als SHA-256-Hash.
Eingaben werden vorher normalisiert: Leerzeichen am Rand weg, mehrere Leerzeichen zu einem,
Groß/Kleinschreibung egal (`" Hallo Welt "` = `"hallo welt"`).

Die mitgelieferten Platzhalter-Passwörter bitte alle durch eigene ersetzen.

### Neuen Hash erzeugen

Kommandozeile (Node ≥ 18):

```bash
node tools/hash.mjs meinneuespasswort
```

Oder im Browser: Server starten (siehe unten) und `http://localhost:8000/tools/hash.html`
öffnen. Den ausgegebenen Hash bei `passwordHash` eintragen und den passenden `hint`
anpassen. Mehrere erlaubte Passwörter gehen auch: `passwordHash: ["hash1", "hash2"]`.

### Ehrlicher Hinweis zur Sicherheit

Das ist ein **Überraschungs-Schloss, kein echter Schutz.** Alles läuft im Browser: Wer
`data.js` öffnet, sieht alle Texte, und kurze Passwörter lassen sich aus dem Hash
leicht erraten. Die Hashes verhindern nur, dass Caro die Lösung beim Blick in den
Quelltext sofort abliest – und gesperrte Titel stehen bis zum Entsperren nicht im
sichtbaren DOM. **Keine sensiblen Daten eintragen** (keine Codes, Buchungsnummern,
Adressen Dritter …).

## Zurücksetzen

- **Auswahl zurücksetzen:** in der Karte des gewählten Vormittags ganz unten
  (mit Rückfrage) – danach kann neu gewählt werden.
- **Alles zurücksetzen:** im Footer auf das kleine goldene Herz tippen → „Alles
  zurücksetzen“ (mit Rückfrage). Danach ist alles wieder verschlossen, inklusive Gate
  und Begrüßungs-Konfetti.
- Ändert man in `data.js` den `storageKey`, gilt die Seite für **alle** Besucher als neu.

Der Zustand liegt nur im `localStorage` des jeweiligen Browsers – auf Caros Handy
und deinem Rechner unabhängig voneinander.

## Lokal testen

```bash
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen. (Per Doppelklick auf `index.html` funktioniert es
nicht, weil Browser ES-Module von `file://` blockieren.)

Mit dem Handy im selben WLAN: `http://<IP-deines-Rechners>:8000` – dort fehlt HTTPS,
deshalb rechnet die Seite den Hash mit einer eingebauten Ersatz-Implementierung; das
funktioniert genauso.

### Automatische Tests (optional)

```bash
cd tests
npm install
node e2e.mjs          # alle Abläufe + Screenshots nach tests/screenshots/
node lighthouse.mjs   # Lighthouse Accessibility/Best Practices
node make-placeholders.mjs   # Platzhalterbilder neu erzeugen
```

Die Tests nutzen den installierten Google Chrome (`/usr/bin/google-chrome-stable`, über
die Umgebungsvariable `CHROME=…` änderbar). Passwörter in `tests/e2e.mjs` müssen zu
deinen geänderten Passwörtern passen, sonst schlagen die Tests fehl.

## Veröffentlichen

Die Seite liegt vollständig im Projektordner. Der Ordner `tests/` wird nicht gebraucht
(und `tests/node_modules` ist groß) – beim Hochladen weglassen bzw. per `.gitignore`
ausgeschlossen.

### GitHub Pages

1. Neues Repository anlegen. Privat ist schöner (Pages für private Repos braucht
   GitHub Pro/Team), ändert aber nichts daran, dass die veröffentlichte Seite samt
   `data.js` für jeden mit Link abrufbar ist – das Repo ist privat, die Seite nicht.
2. Dateien pushen (`.gitignore` hält `tests/node_modules` und die Screenshots raus).
3. *Settings → Pages → Build and deployment → Deploy from a branch*, Branch `main`,
   Ordner `/ (root)`.
4. Nach ein bis zwei Minuten läuft die Seite unter `https://<name>.github.io/<repo>/`.

### Netlify

- **Drag & Drop:** auf app.netlify.com → *Add new site → Deploy manually* den
  Projektordner **ohne** `tests/` hineinziehen.
- **Mit Git:** Repository verbinden, *Build command* leer lassen, *Publish directory* `.`.
- Unter *Site configuration → Change site name* einen unauffälligen Namen wählen.

`<meta name="robots" content="noindex">` ist gesetzt, damit Suchmaschinen die Seite
nicht aufnehmen. Den Link trotzdem nur Caro geben.

## Barrierefreiheit & Bewegung

- Bedienbar per Tastatur: Kacheln sind Buttons, Dialoge halten den Fokus (Tab bleibt
  drin), Escape schließt, der Fokus springt danach zurück zur Kachel.
- Mobile Karte: Schließen per Button, Escape oder nach unten wischen.
- Bei „Bewegung reduzieren“ im Betriebssystem entfallen Konfetti, Funkeln und
  Aufklapp-Animationen.
- Lighthouse Accessibility: 100 (Gate, Dashboard gesperrt und entsperrt, mobil und Desktop).
