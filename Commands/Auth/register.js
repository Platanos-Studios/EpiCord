const { SlashCommandBuilder } = require('@discordjs/builders');
const { addAutoLogin, saveLogins, testLogin } = require('../../Services/requests');

module.exports = {
	data: new SlashCommandBuilder().setName('register').setDescription('Register to the bot using the intra autologin').addStringOption((option) => {
		return option.setName('login').setDescription('Your intranet login').setRequired(true);
	}),
	async execute(interaction) {
		const login = interaction.options.getString('login');

		await addAutoLogin(login, interaction.member.id);
		if (await testLogin()) {
			saveLogins()
			interaction.reply("Sucessfully registered !")
		} else
			interaction.reply("An error occured");
	}
}