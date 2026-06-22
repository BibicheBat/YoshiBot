// utils/giveaway.js
const { EmbedBuilder } = require('discord.js');
const { getGiveaways, saveGiveaways } = require('../data/db');

async function checkGiveaways(client) {
  const giveaways = getGiveaways();
  const now = Date.now();
  let changed = false;

  for (let i = 0; i < giveaways.length; i++) {
    const g = giveaways[i];
    if (g.ended || g.endsAt > now) continue;

    try {
      const channel = await client.channels.fetch(g.channelId).catch(() => null);
      if (!channel) { giveaways[i].ended = true; changed = true; continue; }

      const message = await channel.messages.fetch(g.messageId).catch(() => null);
      if (!message) { giveaways[i].ended = true; changed = true; continue; }

      // Get participants from reactions
      const reaction = message.reactions.cache.get('🎉');
      let participants = [];
      if (reaction) {
        const users = await reaction.users.fetch();
        participants = users.filter(u => !u.bot).map(u => u);
      }

      const embed = new EmbedBuilder()
        .setTitle('🎉 GIVEAWAY TERMINÉ')
        .setColor(0xFF6B9D)
        .setTimestamp();

      if (participants.length === 0) {
        embed.setDescription(`**${g.prize}**\n\n😢 Personne n'a participé...`);
      } else {
        const winners = [];
        const pool = [...participants];
        for (let w = 0; w < Math.min(g.winners, pool.length); w++) {
          const idx = Math.floor(Math.random() * pool.length);
          winners.push(pool.splice(idx, 1)[0]);
        }
        const winnerMentions = winners.map(w => `<@${w.id}>`).join(', ');
        embed.setDescription(`**${g.prize}**\n\n🏆 **Gagnant(s) :** ${winnerMentions}\n📊 Participants : ${participants.length}`);
        await channel.send(`🎊 Félicitations ${winnerMentions} ! Tu as gagné **${g.prize}** !`);
      }

      await message.edit({ embeds: [embed], components: [] });
      giveaways[i].ended = true;
      changed = true;
    } catch (err) {
      console.error('Erreur giveaway:', err);
      giveaways[i].ended = true;
      changed = true;
    }
  }

  if (changed) saveGiveaways(giveaways);
}

function msToTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}j ${h % 24}h`;
  if (h > 0) return `${h}h ${m % 60}min`;
  if (m > 0) return `${m}min`;
  return `${s}s`;
}

module.exports = { checkGiveaways, msToTime };
