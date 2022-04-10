const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
	data: new SlashCommandBuilder().setName('ping').setDescription('Answers Pong'),
	async execute(interaction) {
		const ping = Date.now() - interaction.createdTimestamp;
		await interaction.reply(`Pong! Your ping is ${ping}ms`);
	}
}