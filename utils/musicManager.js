// utils/musicManager.js
const { Player } = require('discord-player');

let player;

async function getPlayer(client) {
  if (player) return player;

  player = new Player(client);

  // Debug : voir ce qu'exporte @discord-player/extractor
  try {
    const extractor = require('@discord-player/extractor');
    console.log('[Music] Exports disponibles:', Object.keys(extractor));

    // Essaie tous les extractors possibles
    const toTry = [
      'YoutubeiExtractor',
      'YouTubeExtractor', 
      'SoundCloudExtractor',
      'SpotifyExtractor',
    ];

    for (const name of toTry) {
      if (extractor[name]) {
        try {
          await player.extractors.register(extractor[name], {});
          console.log(`[Music] ${name} chargé !`);
        } catch(e) {
          console.error(`[Music] ${name} erreur:`, e.message);
        }
      }
    }
  } catch(e) {
    console.error('[Music] Erreur import extractor:', e.message);
  }

  console.log('[Music] Extractors actifs:', [...player.extractors.store.keys()]);
  return player;
}

module.exports = { getPlayer };