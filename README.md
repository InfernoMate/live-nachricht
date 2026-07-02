# Twitch Live Tracker für Discord

Ein sauber strukturierter und ressourcenschonender Discord-Bot, der deine Community-Mitglieder automatisch trackt und in einem schicken Embed auflistet, sobald sie auf Twitch live gehen.

## ✨ Features

* **Ressourcenschonend:** Nutzt den Discord Presence-Cache, um API-Limits zu vermeiden.
* **Automatische Updates:** Aktualisiert das Live-Embed vollautomatisch alle 5 Minuten.
* **Manuelles Override:** Beinhaltet einen Admin-Slash-Command (`/updatestreams`), um die Liste bei Bedarf sofort zu aktualisieren.
* **Sichere Konfiguration:** Trennung von Code und sensiblen Daten über eine dedizierte Config-Datei.

---

## 🛠️ Voraussetzungen

Bevor du den Bot startest, benötigst du Folgendes:
* **Node.js** (Version 16.9.0 oder neuer)
* Einen **Discord Bot** (mit aktiviertem *Presence Intent* und *Server Members Intent* im Developer Portal)
* Eine **Twitch-App** im Twitch Developer Portal (für Client ID & Secret)

---

## 📦 Installation & Setup

**Schritt 1: Dateien herunterladen**
Lade dir die Dateien aus diesem Repository herunter und entpacke sie in einen leeren Ordner.

**Schritt 2: Abhängigkeiten installieren**
Öffne ein Terminal in diesem Ordner und installiere die benötigten Pakete mit folgendem Befehl:
```bash
npm install
```

**Schritt 3: Konfiguration einrichten**
1. Benenne die Datei `config.example.json` in `config.json` um.
2. Öffne die `config.json` in einem Texteditor und trage deine spezifischen IDs und Tokens ein:
   * `TWITCH_CLIENT_ID` & `TWITCH_CLIENT_SECRET`: Von deiner Twitch Dev-App.
   * `LIVE_CHANNEL_ID`: Die ID des Discord-Kanals, in dem das Embed gepostet werden soll.
   * `ADMIN_ID`: Deine persönliche Discord User-ID (für den manuellen Update-Befehl).
   * `BOT_TOKEN`: Dein Discord Bot Token.
   * `GUILD_ID`: Die Server-ID deines Discord-Servers.
   * `CLIENT_ID`: Die Application-ID deines Discord-Bots.

**Schritt 4: Slash-Commands registrieren**
Führe dieses Skript einmalig aus, um den `/updatestreams` Befehl auf deinem Server zu registrieren:
```bash
node deploy-commands.js
```

**Schritt 5: Bot starten**
Starte den Bot final mit:
```bash
node index.js
```
*(Tipp: Für den 24/7-Betrieb auf einem Server empfiehlt sich die Nutzung von Tools wie `pm2`)*
