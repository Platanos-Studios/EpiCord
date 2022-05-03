const { SlashCommandBuilder } = require("@discordjs/builders");
const { getConfig, saveConfig } = require("../../Services/requests");

module.exports = {
	data: new SlashCommandBuilder().setName('channel').setDescription('Sets the announcement channel').addChannelOption((option) => {
		return option.setName('channel').setDescription('The channel to send the announcement').setRequired(true);
	}),
	async execute(interaction) {
		const channel = interaction.options.getChannel('channel')
		const guildID = interaction.guild.id
		let config = getConfig()
		config[guildID] = channel.id
		saveConfig(config)
		interaction.reply(`Successfully changed announcement channel to <#${channel.id}>`)
	}
}