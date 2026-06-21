// commands/fun/yoshi.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { YOSHI_EMOJIS } = require('../../utils/yoshiGame');

const YOSHI_GIFS = [
  'https://tenor.com/view/yoshi-teeth-mouth-yum-tasty-gif-4067011068543758264',
  'https://tenor.com/view/yoshi-mario-cute-yoshi-mario-jocelynmadethis-gif-2838911223277838827',
  'https://tenor.com/view/smbz-yoshi-gif-21805784',
  'https://tenor.com/view/yoshi-tv-yoshi-bailando-yoshi-dancando-gran-hermano-gh2022-gif-26983326',
  'https://tenor.com/view/yoshi-mario-yoshis-island-super-smash-brother-super-smash-brother-n64-gif-21681448',
  'https://tenor.com/view/yoshi-mario-luigi-toad-the-super-mario-galaxy-movie-gif-1181807363692287298',
  'https://tenor.com/view/angry-yoshi-the-super-mario-galaxy-movie-mad-fierce-gif-8715070347444219795',
  'https://tenor.com/view/mario-kart-world-mario-kart-yoshi-dancing-mario-kart-world-character-select-screen-dance-mario-kart-world-character-select-screen-dancing-gif-14560011358558026344',
  'https://tenor.com/view/big-yoshi-beeg-yoshi-mario-rpg-gif-7187103637593349944',
  'https://tenor.com/view/yoshi-wave-yoshi-gif-3768309686931636451',
  'https://tenor.com/view/yoshi-mario-mario-party-superstars-dance-gif-23646599',
];


// Phrases avec les emojis Yoshi custom (résolu au moment de l'exécution)
function getYoshiPhrases() {
  return [
    `Yoshi ! ${YOSHI_EMOJIS.danse} 🥚`,
    `Yoshiiiii ! ${YOSHI_EMOJIS.vert} 💚`,
    `Miam miam ! ${YOSHI_EMOJIS.danse2} 👅`,
    `Yoshi est là pour toi ! ${YOSHI_EMOJIS.danse} 💕`,
    `Regarde ce Yoshi adorable ! ${YOSHI_EMOJIS.vert}`,
    `Yoshi approuve ce message ! ${YOSHI_EMOJIS.danse2} ✅`,
    `Yoshi saute de joie ! ${YOSHI_EMOJIS.danse} 🌟`,
    `*sons de Yoshi* ${YOSHI_EMOJIS.violet} 🎵`,
    `Un Yoshi gris mystérieux... ${YOSHI_EMOJIS.gris} 👀`,
    `Yoshi danse pour toi ! ${YOSHI_EMOJIS.danse} 🎶`,
  ];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yoshi')
    .setDescription('Envoie un GIF Yoshi au hasard !'),

  async execute(interaction) {
    const gif = YOSHI_GIFS[Math.floor(Math.random() * YOSHI_GIFS.length)];
    const phrases = getYoshiPhrases();
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];

    const embed = new EmbedBuilder()
      .setTitle(phrase)
      .setColor(0x4CAF50)
      .setImage(gif)
      .setFooter({ text: `GIF envoyé par ${interaction.user.tag}` });

    await interaction.reply({ embeds: [embed] });
  },
};
