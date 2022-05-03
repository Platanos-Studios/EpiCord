const { SlashCommandBuilder } = require("@discordjs/builders");
const { removeAutoLogin } = require("../../Services/requests");

module.exports = {
	data: new SlashCommandBuilder().setName('unregister').setDescription('Unregister from the bot'),
	async execute(interaction) {
		removeAutoLogin(interaction.member.id)
		await interaction.reply('Sucessfully unregistered !')
	}
}