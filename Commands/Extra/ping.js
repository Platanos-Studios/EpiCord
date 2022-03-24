const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
	data: new SlashCommandBuilder().setName('ping').setDescription('Answers Pong'),
	async execute(interaction) {
		await interaction.reply('pong');
	}
}