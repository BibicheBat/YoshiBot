// commands/admin/envoyer.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { YOSHI_EMOJIS } = require('../../utils/yoshiGame');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('envoyer')
    .setDescription('📢 Envoyer un message sous le nom du bot Yoshi')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt =>
      opt.setName('message').setDescription('Le message à envoyer').setRequired(true)
    )
    .addChannelOption(opt =>
      opt.setName('salon').setDescription('Salon cible (défaut : salon actuel)').setRequired(false)
    )
    .addBooleanOption(opt =>
      opt.setName('embed').setDescription('Envoyer en format embed ?').setRequired(false)
    ),

  async execute(interaction) {
    const texte = interaction.options.getString('message');
    const salon = interaction.options.getChannel('salon') || interaction.channel;
    const useEmbed = interaction.options.getBoolean('embed') ?? false;

    try {
      if (useEmbed) {
        const embed = new EmbedBuilder()
          .setDescription(`${YOSHI_EMOJIS.danse} ${texte}`)
          .setColor(0x4CAF50)
          .setFooter({ text: 'Yoshi Bot', iconURL: interaction.client.user.displayAvatarURL() });
        await salon.send({ embeds: [embed] });
      } else {
        await salon.send(`${YOSHI_EMOJIS.danse} ${texte}`);
      }

      await interaction.reply({ content: `✅ Message envoyé dans <#${salon.id}> !`, ephemeral: true });
    } catch (err) {
      await interaction.reply({ content: `❌ Impossible d'envoyer dans ce salon : ${err.message}`, ephemeral: true });
    }
  },
};
