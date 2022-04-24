const { SlashCommandBuilder } = require('@discordjs/builders')
const { getRegisteredActivities, getLogin } = require("../../Services/requests.js")
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder().setName('activities').setDescription('Gets the intra activities between two dates, default is today and tomorrow').addStringOption((option) => {
		return option.setName('start').setDescription(`The start date, format is YYYY MM DD, MM DD or DD`).setRequired(false);
	}).addStringOption((option) => {
		return option.setName('end').setDescription(`The end date, format is YYYY MM DD, MM DD or DD`).setRequired(false);
	}),
	async execute(interaction) {
		const startString = interaction.options.getString('start')
		const endString = interaction.options.getString('end')
		const start = startString ? new Date(startString) : new Date()
		const end = endString ? new Date(endString) : new Date(start.getTime() + (24 * 60 * 60 * 1000))
		const data = await getRegisteredActivities(getLogin(interaction.member.id), start, end);
		const fields = data.map((e) => ({
			name: e.acti_title,
			value: `${e.start.substring(8, 10)}/${e.start.substring(5, 7)} - ${e.start.substring(11, 16)} - ${e.room?.code ? e.room.code.split('/')[e.room.code.split('/').length - 1] : "No room"}`,
			inline: true
		}))

		const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Activities')
			.setFields(...fields)
		interaction.reply({ embeds: [embed] })
	}
}