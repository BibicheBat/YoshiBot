# Bot Yoshi — Guide d'installation

## Prerequis

- Node.js v18 ou superieur
- Un Bot Discord cree sur https://discord.com/developers/applications
- FFmpeg installe sur ton systeme (pour la musique)

---

## Installation

```bash
npm install
cp .env.example .env
```

Remplis le fichier `.env` :
```
TOKEN=TON_TOKEN_BOT_DISCORD
CLIENT_ID=TON_CLIENT_ID
```

---

## Emojis animés a configurer (2 restants)

Tous les emojis Yoshi statiques sont deja integres ! Il reste uniquement
a renseigner les IDs des 2 emojis animes dans `utils/yoshiGame.js` :

| Variable | Emoji Discord     | Comment trouver l'ID                        |
|----------|-------------------|---------------------------------------------|
| danse    | yoshi_qui_danse   | Tape \:yoshi_qui_danse: dans un salon       |
| danse2   | Yoshi_Dance       | Tape \:Yoshi_Dance: dans un salon           |

Discord affichera : <a:yoshi_qui_danse:123456789>
Copie ce format complet dans le fichier.

### Emojis deja integres

| Couleur    | Emoji Discord                              |
|------------|--------------------------------------------|
| Bleu       | Blue_Yoshi:1517819395802402916             |
| Bleu clair | Light_Blue_Yoshi:1517820817914855424       |
| Gris       | Gray_Yoshi:1517820607394480249             |
| Dore       | Gold_Yoshi:1517820410140557392             |
| Vert       | Green_Yoshi:1517585241097764944            |
| Jaune      | Yellow_Yoshi:1517819627072131213           |
| Rouge      | Red_Yoshi:1517818713867423914              |
| Violet     | Purple_Yoshi:1517819908056940544           |
| Orange     | Orange_Yoshi:1517819505210818560           |
| Rose       | (emoji Unicode 🌸 — pas d'emoji custom)   |

---

## Permissions du bot Discord

Sur le Developer Portal, active ces Privileged Gateway Intents :
- PRESENCE INTENT
- SERVER MEMBERS INTENT
- MESSAGE CONTENT INTENT

Lien d'invitation (remplace CLIENT_ID) :
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

---

## Lancer le bot

```bash
npm start       # Production
npm run dev     # Developpement (redemarrage auto)
```

---

## Liste des commandes

### Informations
- /info            — Infos sur le bot
- /info-user       — Infos sur un utilisateur
- /info-serveur    — Infos sur le serveur

### Musique
- /play <recherche>        — Lancer une musique YouTube
- /pause                   — Pause / reprendre
- /skip                    — Musique suivante
- /stop                    — Arreter et vider la file
- /queue                   — Voir la file d'attente
- /yoshi-music [musique]   — Playlist Yoshi officielle

### Jeu Yoshi
- /adopter <couleur>       — Adopter ton Yoshi
- /mon-yoshi [@joueur]     — Voir son Yoshi
- /collecter               — Collecter des oeufs (cooldown 4h)
- /soigner                 — Soigner son Yoshi (cout : 10 oeufs)
- /competences             — Debloquer des competences
- /couple <@joueur>        — Proposer un couple
- /divorcer                — Separer son Yoshi
- /combat <@joueur>        — Defier un autre Yoshi
- /renommer <nom>          — Renommer son Yoshi
- /classement              — Classement du serveur
- /yoshi                   — GIF Yoshi aleatoire

### Administration
- /ban <@membre>           — Bannir
- /unban <id>              — Debannir
- /kick <@membre>          — Expulser
- /mute <@membre> <duree>  — Mettre en sourdine
- /unmute <@membre>        — Retirer le mute
- /warn <@membre> <raison> — Avertir
- /warns liste/effacer     — Gerer les avertissements
- /clear <nombre>          — Supprimer des messages
- /envoyer <message>       — Envoyer un message sous le bot
- /giveaway <lot> <duree>  — Creer un giveaway

---

## Structure du projet

```
yoshi-bot/
├── index.js
├── package.json
├── .env
├── commands/
│   ├── admin/     ban, unban, kick, mute, unmute, warn, warns, clear, envoyer, giveaway
│   ├── fun/       yoshi
│   ├── info/      info, info-user, info-serveur
│   ├── music/     play, pause, skip, stop, queue, yoshi-music
│   └── yoshi-game/ adopter, mon-yoshi, collecter, soigner, competences,
│                    couple, divorcer, combat, renommer, classement
├── utils/
│   ├── yoshiGame.js      — Logique du jeu + emojis
│   ├── musicManager.js   — Musique vocale
│   ├── giveaway.js       — Systeme de giveaway
│   └── buttonHandler.js  — Boutons Discord
└── data/
    ├── db.js
    ├── yoshis.json        — Donnees joueurs (auto-cree)
    └── warns.json         — Avertissements (auto-cree)
```
