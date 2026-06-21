// utils/musicManager.js
const { Player } = require('discord-player');
const { YoutubeExtractor } = require('@discord-player/extractor');
 
let player;
 
async function getPlayer(client) {
  if (player) return player;
 
  player = new Player(client, {
    ytdlOptions: {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    },
  });
 
  try {
    await player.extractors.register(YoutubeExtractor, {});
    console.log('[Music] YoutubeExtractor chargé avec @distube/ytdl-core');
  } catch(e) {
    console.error('[Music] Erreur extractor:', e.message);
  }
 
  console.log('[Music] Extractors actifs:', [...player.extractors.store.keys()]);
  return player;
}
 
module.exports = { getPlayer };
 