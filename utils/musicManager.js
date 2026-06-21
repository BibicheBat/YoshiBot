// utils/musicManager.js
const { Player } = require('discord-player');
const { YoutubeExtractor, SoundCloudExtractor } = require('@discord-player/extractor');
const fs = require('fs');
const path = require('path');

let player;

async function getPlayer(client) {
  if (player) return player;

  player = new Player(client);

  const cookie = process.env.YOUTUBE_COOKIE;

  if (cookie) {
    try {
      // Écrire le cookie dans un fichier temporaire
      const cookiePath = path.join('/tmp', 'yt-cookies.txt');
      fs.writeFileSync(cookiePath, cookie);
      console.log('[Music] Cookie YouTube écrit dans', cookiePath);

      await player.extractors.register(YoutubeExtractor, {
        cookies: cookie,
      });
      console.log('[Music] YoutubeExtractor chargé avec cookies');
    } catch(e) {
      console.error('[Music] YouTube erreur:', e.message);
    }
  } else {
    console.log('[Music] Pas de cookie YouTube, SoundCloud uniquement');
  }

  // SoundCloud toujours en fallback
  try {
    await player.extractors.register(SoundCloudExtractor, {});
    console.log('[Music] SoundCloudExtractor chargé');
  } catch(e) {
    console.error('[Music] SoundCloud erreur:', e.message);
  }

  console.log('[Music] Extractors actifs:', [...player.extractors.store.keys()]);
  return player;
}

module.exports = { getPlayer };