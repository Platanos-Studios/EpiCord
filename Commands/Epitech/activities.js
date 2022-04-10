const { SlashCommandBuilder } = require('@discordjs/builders')
const { getRegisteredActivities } = require("../../Services/requests.js")

module.exports = {
	data: new SlashCommandBuilder().setName('activities').setDescription('Gets the intra activities between two dates, default is today and tomorrow').addStringOption((option) => {
		return option.setName('start').setDescription('The start date, format is YYYY MM DD').setRequired(false);
	}).addStringOption((option) => {
		return option.setName('end').setDescription('The end date, format is YYYY MM DD').setRequired(false);
	}),
	async execute(interaction) {
		const start = new Date(interaction.options.getString('start'));
		const end = new Date(interaction.options.getString('end'));
		const data = await getRegisteredActivities("https://intra.epitech.eu/auth-b8c83ba5e6a78ed8ef56c6cad9b68d7823523b98", start, end);
		let str = "Activities:\n\n";
		data.forEach((e) => {
			str += `${e.acti_title} - ${e.start} - ${e.end}\n`;
		})
		interaction.channel.send(str);
		interaction.reply("Activities sent!");
	}
}