// utils/musicManager.js
const { Player } = require('discord-player');

let player;

async function getPlayer(client) {
  if (player) return player;

  player = new Player(client);

  try {
    const { YoutubeiExtractor } = require('@discord-player/extractor');
    await player.extractors.register(YoutubeiExtractor, {});
    console.log('[Music] YoutubeiExtractor OK');
  } catch(e1) {
    console.error('[Music] YoutubeiExtractor échoué:', e1.message);
    try {
      await player.extractors.loadDefault();
      console.log('[Music] Extractors par défaut chargés');
    } catch(e2) {
      console.error('[Music] Impossible de charger les extractors:', e2.message);
    }
  }

  console.log('[Music] Extractors actifs:', [...player.extractors.store.keys()]);
  return player;
}

module.exports = { getPlayer };