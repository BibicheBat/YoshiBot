// utils/musicManager.js
const { Player } = require('discord-player');
const { YoutubeiExtractor } = require('@discord-player/extractor');

let player;

async function getPlayer(client) {
  if (player) return player;
  player = new Player(client);
  await player.extractors.register(YoutubeiExtractor, {
    streamOptions: { useClient: 'ANDROID' }
  });
  console.log('[Music] discord-player prêt');
  return player;
}

module.exports = { getPlayer };
