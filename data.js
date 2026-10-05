// ════════════════════════════════════════════════════════════════════════
//  ALLE INHALTE DER SEITE – hier darfst du alles ändern, ohne Code anzufassen.
//
//  • Texte einfach zwischen den Anführungszeichen ändern.
//  • Zeilenumbruch in längeren Texten: "\n\n" erzeugt einen neuen Absatz.
//  • Passwörter stehen NICHT im Klartext hier, sondern als Hash.
//    Neuen Hash erzeugen:  node tools/hash.mjs meinpasswort
//    (oder tools/hash.html im Browser öffnen) und den Hash unten einsetzen.
//  • Bilder: Datei in images/ ersetzen (gleicher Name) – fertig.
// ════════════════════════════════════════════════════════════════════════

export default {
  // ── Allgemeines ──────────────────────────────────────────────────────
  settings: {
    name: "Caro",
    from: "Jan",
    // Datum des Geburtstags (für Countdown und Anzeige). Zeitzone Deutschland (Winterzeit +01:00).
    birthday: "2026-12-03T00:00:00+01:00",
    // Startzeit auf den gesperrten Kacheln zeigen? true = ja, false = nein
    showTimeOnDashboard: true,
    // Name des Speichers im Browser. Ändern = alles ist für alle wieder gesperrt.
    storageKey: "caro-geburtstag-2026",
  },

  // ── Passwörter (SHA-256-Hashes, siehe README) ────────────────────────
  // Platzhalter-Passwörter im Klartext stehen in der README – bitte ändern!
  gate: {
    passwordHash: "390589403930e2e615cee5b15d725354adab2c487c8d0e261f8c6071342e29c2",
    title: "Für Caro.",
    subtitle: "Nur für dich.",
    prompt: "Hinter diesem Schloss wartet ein ganzer Tag - extra nur für dich. Kennst du schon das Zauberwort?",
    label: "Passwort",
    button: "Öffnen",
    hint: "Dein Name und das Jahr, in dem dieser Tag stattfindet.",
    wrong: [
      "Hm, das war's noch nicht. Versuch's gleich nochmal.",
      "Fast! Atme kurz durch und probier's nochmal.",
      "Noch nicht ganz – vielleicht hilft der Tipp?",
    ],
  },

  // ── Texte auf der Übersicht ─────────────────────────────────────────
  dashboard: {
    kicker: "3. Dezember 2026",
    greeting: "Happy Birthday, Caro",
    intro:
      "Ich schenke dir einen ganzen Tag. Von morgens bis abends habe ich ein paar Dinge geplant, " +
      "die dir hoffentlich ein Lächeln ins Gesicht zaubern. Was genau, verrate ich dir Schritt für Schritt – " +
      "jede Karte hat ihr eigenes kleines Schloss.",
    countdownLabel: "Bis zu deinem Tag",
    countdownToday: "Heute ist dein Tag! Alles Liebe zum Geburtstag.",
    countdownPast: "Danke, dass ich diesen Tag mit dir verbringen durfte.",
    programTitle: "Dein Tag",
    lockedHint: "Tippe auf eine Karte, um sie zu öffnen.",
    footer: "Mit ganz viel Liebe gemacht von Jan",
  },

  // ── Texte in Dialogen ───────────────────────────────────────────────
  ui: {
    unlockTitle: "Diese Karte ist noch verschlossen",
    unlockLabel: "Passwort für diese Karte",
    unlockButton: "Entsperren",
    hintLabel: "Kleiner Tipp",
    // Steht im Passwort-Dialog, solange der Tipp noch nicht freigeschaltet ist (siehe hintFrom).
    hintLocked: "Hinweise gibts erst an deinem großen Tag",
    wrong: "Leider nicht ganz. Lies den Tipp nochmal – du schaffst das!",
    lockedName: "Verschlossene Überraschung",
    close: "Schließen",
    salutation: "Liebe Caro,",
    when: "Wann",
    where: "Wo",
    openMaps: "In Karten öffnen",
    wear: "Was ziehst du an?",
    bring: "Bitte einpacken",
    note: "Gut zu wissen",
    clock: "Uhr",
    choiceTile: "Du hast die Wahl",
    choiceTitle: "Wie möchtest du deinen Vormittag verbringen?",
    choiceIntro: "Zwei Ideen und du darfst wählen. Schau dir beide in Ruhe an und entscheide dich für eine.",
    choose: "Das machen wir",
    confirmQuestion: "Sicher? Dann ist der Vormittag gebucht.",
    confirmYes: "Ja, genau das!",
    confirmNo: "Doch nochmal überlegen",
    chosen: "Abgemacht! Ich freu mich drauf.",
    resetChoice: "Auswahl zurücksetzen",
    resetChoiceQuestion: "Möchtest du die Vormittags-Wahl wirklich wieder öffnen?",
    resetAll: "Alles zurücksetzen",
    resetAllQuestion: "Wirklich alles zurücksetzen? Danach sind Seite und alle Karten wieder verschlossen.",
    yes: "Ja",
    cancel: "Abbrechen",
    toolsLabel: "Werkzeuge für Jan",
  },

  // ── Das Programm (in zeitlicher Reihenfolge) ─────────────────────────
  // Fahrten und Puffer stehen absichtlich nirgends.
  //
  // Felder einer Aktivität:
  //   id            interner Name (nicht ändern, sonst gilt die Karte als neu gesperrt)
  //   icon          Symbol: cup, snow, market, golf, dinner, spa
  //   accent        Farbe: gold, ice, market, neon, amber, teal
  //   start / end   Uhrzeit "HH:MM"; end darf leer sein ("")
  //   endPrefix     z. B. "ca." vor der Endzeit
  //   startPrefix   z. B. "ab" vor der Startzeit
  //   passwordHash  Hash des Passworts (siehe oben)
  //   hint          Rätsel/Tipp im Passwort-Dialog (leer lassen = kein Tipp)
  //   hintFrom      ab wann der Tipp sichtbar ist (Datum wie bei settings.birthday).
  //                 Weglassen = ab dem Geburtstag; davor steht ui.hintLocked.
  //   title         Name der Aktivität (erst nach dem Entsperren sichtbar)
  //   tagline       kurzer Untertitel auf der Karte
  //   place         { name, address, mapsQuery }  – address leer = keine Adresse/kein Kartenlink
  //   image         Bildpfad, imageAlt = Bildbeschreibung
  //   description   liebevolle Beschreibung (Absätze mit \n\n)
  //   wear          Dresscode
  //   bring         Liste zum Einpacken
  //   note          Hinweis-Feld für Besonderes
  activities: [
    {
      id: "fruehstueck",
      icon: "cup",
      accent: "gold",
      start: "08:00",
      end: "10:00",
      passwordHash: "435e2a5662904f649cd72151c9194b295353d92b0396d3e53bb182b59e3d4a56",
      hintFrom: "2026-12-02T00:00:00+01:00", // Frühstück: schon einen Tag vorher
      hint: "Ohne mich startest du keinen Morgen. Ich bin schwarz, heiß und manchmal mit Milch.",
      title: "Frühstück im Hofcafé",
      tagline: "Ein Morgen in Zweisamkeit",
      place: {
        name: "Hofcafé Sulzburghof",
        address: "Max-Eyth-Str. 20, 73230 Kirchheim unter Teck",
        mapsQuery: "Hofcafé Sulzburghof, Max-Eyth-Str. 20, 73230 Kirchheim unter Teck",
      },
      image: "images/fruehstueck.jpg",
      imageAlt: "Platzhalterbild: gedeckter Frühstückstisch in warmem Gold",
      description:
        "Dein Geburtstag beginnt nicht mit Stress, sondern mit duftendem Kaffee, frischen Brötchen " +
        "und allem worauf du Lust hast.\n\n" +
        "Im Sulzburgcafé setzen wir uns gemütlich hin, lassen den Morgen langsam ankommen und stoßen " +
        "auf deinen Geburtstag an. Zwei Stunden nur für uns - bestell einfach, worauf du Lust hast.",
      wear: "Schick-bequem. Etwas, in dem du dich hübsch fühlst und trotzdem zwei Stunden entspannt sitzen kannst.",
      bring: ["Gute Laune", "Hunger", "Eine warme Jacke für den Weg"],
      note: "Du musst an nichts denken – der Tisch ist reserviert.",
    },

    {
      // Die Vormittags-Wahl: zwei Optionen, ein gemeinsames Passwort.
      id: "vormittag",
      type: "choice",
      icon: "choice",
      accent: "choice",
      start: "10:30",
      end: "12:00",
      passwordHash: "30c5461fc27b84f1f1ad0a83162a26882b22d11cdfa45978dd21c810056e8d0e",
      hint: "Die Jahreszeit, in der du Geburtstag hast.",
      options: [
        {
          id: "schnee",
          icon: "snow",
          accent: "ice",
          title: "Schneespaziergang auf der Alb",
          tagline: "Frische Luft, super Aussicht",
          place: {
            name: "Randecker Maar & Albtrauf",
            address: "Schwäbische Alb",
            mapsQuery: "Randecker Maar",
          },
          image: "images/schnee.jpg",
          imageAlt: "Platzhalterbild: verschneite Albhügel in Eisblau",
          description:
            "Wir fahren hoch auf die Alb und laufen am Randecker Maar entlang des Albtraufs ungefähr zwei " +
            "Stunden einen leichten Weg, bei dem man gut nebeneinander reden kann.\n\n" +
            "Wenn Schnee liegt, knirscht es unter den Schuhen und die Welt ist ganz leise. Und falls nicht, " +
            "bleibt es ein wunderschöner Spaziergang mit Aussicht bis weit ins Land.",
          wear: "Warme Winterkleidung im Zwiebellook, wasserfeste, dicke Schuhe, Mütze, und Handschuhe.",
          bring: ["Mütze, Handschuhe", "Dicke, wasserfeste Schuhe", "Thermoskanne mit etwas Warmem"],
          note: "Liegt kein Schnee, wird es ein entspannter Spaziergang mit Aussicht - schön wird's sowieso.",
        },
        {
          id: "weihnachtsmarkt",
          icon: "market",
          accent: "market",
          title: "Weihnachtsmarkt Esslingen",
          tagline: "Mittelalter, Lichter und Gebrannte Mandeln",
          place: {
            name: "Mittelalter- und Weihnachtsmarkt",
            address: "Marktplatz, 73728 Esslingen am Neckar",
            mapsQuery: "Marktplatz Esslingen am Neckar",
          },
          image: "images/weihnachtsmarkt.jpg",
          imageAlt: "Platzhalterbild: Marktstände mit Lichterketten in Rot und Tannengrün",
          description:
            "Rund 180 Stände, Fachwerk, Fackeln und Gaukler: Der Esslinger Mittelalter- und Weihnachtsmarkt " +
            "ist einer der schönsten weit und breit.\n\n" +
            "Wir bummeln durch die Gassen, schauen den Handwerkern zu, wärmen uns die Hände am Glühwein " +
            "und naschen uns einmal quer über den Markt.",
          wear: "Warm einpacken und bequeme Schuhe zum enstpannten gehen - wir sind viel auf den Beinen.",
          bring: ["Bequeme Schuhe", "Warme Handschuhe", "Platz im Bauch für Gebranntes und Glühwein"],
          note: "Der Markt öffnet donnerstags um 11:00 Uhr - wir sind also fast die Ersten.",
        },
      ],
    },

    {
      id: "minigolf",
      icon: "golf",
      accent: "neon",
      start: "14:00",
      end: "16:00",
      passwordHash: "1b6405d1ef5a816105210b20a8f0fc129869a25876e45c0891e4f6d972bf74c2",
      hint: "Ich bin ein Gas und leuchte bunt in Reklameschildern",
      title: "Blacklight-Minigolf mit Gästen",
      tagline: "18 Bahnen im Schwarzlicht",
      place: {
        name: "Arcadia 3D Minigolf",
        address: "Metzgerstr. 57–59 (Parkhaus Stadtmitte), 72764 Reutlingen",
        mapsQuery: "Arcadia 3D Minigolf, Metzgerstraße 57, 72764 Reutlingen",
      },
      image: "images/minigolf.jpg",
      imageAlt: "Platzhalterbild: leuchtende Minigolfbahn in Neonviolett, Pink und Cyan",
      description:
        "Zusammen mit anderen spielen wir 18 Bahnen Minigolf im Schwarzlicht - mit " +
        "3D-Brille, bei der die Wände plötzlich lebendig werden.\n\n" +
        "Wer gewinnt, ist eigentlich egal (außer du gewinnst, dann ist es natürlich wichtig). " +
        "Danach gibt es Snacks und wir chillen noch zusammen.",
      wear: "Bequem. Helle oder weiße Kleidung leuchtet im Schwarzlicht besonders schön.",
      bring: ["Etwas Weißes oder Helles zum Anziehen", "Ehrgeiz (optional)"],
      note: "Die 3D-Brillen sind inklusive.",
    },

    {
      id: "abendessen",
      icon: "dinner",
      accent: "amber",
      start: "17:30",
      startPrefix: "ab",
      end: "19:00",
      endPrefix: "ca.",
      passwordHash: "bc5efe441ea271818ec4099b258fb72af08d41cae2c5652bd8082b0d683e3af9",
      hint: "Die Menschen, die dich am längsten kennen und am meisten lieben.",
      title: "Abendessen mit deiner Familie",
      tagline: "Dein Papa kocht",
      place: {
        name: "Bei dir zu Hause",
        address: "",
        mapsQuery: "",
      },
      image: "images/abendessen.jpg",
      imageAlt: "Platzhalterbild: gedeckter Esstisch",
      description:
        "Nach so einem Tag gibt es nichts Schöneres, als nach Hause zu kommen. Dein Papa steht schon in " +
        "der Küche und kocht für dich, der Tisch ist gedeckt, und alle, die dich lieben, sitzen zusammen.\n\n" +
        "Ein Abendessen mit deiner Familie - mit vielen Geschichten, viel Lachen und bestimmt dem einen " +
        "oder anderen Toast auf dich.",
      wear: "Gemütlich-schön. Du bist zu Hause, also zieh an, worin du dich wohlfühlst.",
      bring: ["Nur dich selbst"],
      note: "Vorher ist Zeit zum Durchatmen: Ab 16:30 Uhr chillen wir erst einmal bei dir zu Hause.",
    },

    {
      id: "therme",
      icon: "spa",
      accent: "teal",
      start: "19:30",
      end: "21:45",
      endPrefix: "ca.",
      passwordHash: "bc90a50b2fa0d31ce6125f9ca1fb49983accd9400aeb1ea193af349c9be5f08d",
      hint: "Das Gegenteil von Stress - ein Wort für Entspannung, das auch auf Englisch funktioniert.",
      title: "Panorama Therme Beuren",
      tagline: "Warmes Wasser unter dem Winterhimmel",
      place: {
        name: "Panorama Therme Beuren",
        address: "Am Thermalbad 5, 72660 Beuren",
        mapsQuery: "Panorama Therme Beuren",
      },
      image: "images/therme.jpg",
      imageAlt: "Platzhalterbild: dampfendes Thermalbecken in Türkis unter dem Abendhimmel",
      description:
        "Zum Abschluss lassen wir den Tag im warmen Thermalwasser ausklingen. Draußen ist es kalt und " +
        "dunkel, über uns vielleicht ein paar Sterne und wir treiben im dampfenden Becken.\n\n" +
        "Keine Pläne mehr, kein Zeitstress. Nur warmes Wasser, Ruhe und wir zwei.",
      wear: "Bequeme Kleidung, die schnell an- und ausgezogen ist.",
      bring: [
        "Bikini",
        "Großes Handtuch",
        "Badeschlappen",
        "Wechselkleidung",
      ],
      note: "Die Badezeit endet 15 Minuten vor Schließung.",
    },
  ],
};
