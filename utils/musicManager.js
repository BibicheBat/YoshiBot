// utils/musicManager.js
const { Player } = require('discord-player');
const { YoutubeExtractor } = require('@discord-player/extractor');

let player;

async function getPlayer(client) {
  if (player) return player;

  player = new Player(client);

  try {
    await player.extractors.register(YoutubeExtractor, {});
    console.log('[Music] YoutubeExtractor chargé !');
  } catch(e) {
    console.error('[Music] Erreur YoutubeExtractor:', e.message);
  }

  console.log('[Music] Extractors actifs:', [...player.extractors.store.keys()]);
  return player;
}

module.exports = { getPlayer };