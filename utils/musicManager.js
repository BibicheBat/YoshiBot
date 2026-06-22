// utils/musicManager.js - Lavalink via Kazagumo
const { Kazagumo, Plugins } = require('kazagumo');
const { Shoukaku } = require('shoukaku');

// Serveurs Lavalink publics gratuits
const LAVALINK_NODES = [
  {
    name: 'node1',
    url: 'lavalink.devamop.in:443',
    auth: 'DevamOP',
    secure: true,
  },
  {
    name: 'node2', 
    url: 'lavalink.clxud.dev:443',
    auth: 'youshallnotpass',
    secure: true,
  },
  {
    name: 'node3',
    url: 'lavalink.lexnet.cc:443',
    auth: 'lexn3tl@val!nk',
    secure: true,
  },
];

let kazagumo;

function getKazagumo(client) {
  if (kazagumo) return kazagumo;

  kazagumo = new Kazagumo(
    {
      defaultSearchEngine: 'youtube',
      plugins: [],
    },
    new Shoukaku(client, LAVALINK_NODES, {
      moveOnDisconnect: false,
      resumable: false,
      resumableTimeout: 30,
      reconnectTries: 2,
      restTimeout: 10000,
    }),
    LAVALINK_NODES,
  );

  kazagumo.shoukaku.on('ready', (name) => console.log(`[Lavalink] Node "${name}" connecté`));
  kazagumo.shoukaku.on('error', (name, err) => console.error(`[Lavalink] Node "${name}" erreur:`, err.message));
  kazagumo.shoukaku.on('disconnect', (name) => console.warn(`[Lavalink] Node "${name}" déconnecté`));

  kazagumo.on('playerEnd', (player) => {
    player.textChannel?.send('🎵 File d\'attente terminée ! Yoshi part se reposer... 💤');
    player.destroy();
  });

  kazagumo.on('playerException', (player, track, err) => {
    console.error('[Lavalink] Erreur lecture:', err.message);
    player.textChannel?.send(`❌ Erreur de lecture : \`${err.message}\``);
  });

  console.log('[Music] Kazagumo/Lavalink initialisé');
  return kazagumo;
}

module.exports = { getKazagumo };
