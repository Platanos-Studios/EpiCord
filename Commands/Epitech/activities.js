const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const { getRegisteredActivities, getLogin } = require("../../Services/requests.js")

module.exports = {
	data: new SlashCommandBuilder().setName('activities').setDescription('Gets the intra activities between two dates, default is today and tomorrow').addStringOption((option) => {
		return option.setName('start').setDescription(`The start date, format is DD MM YYYY, DD MM or DD`).setRequired(false);
	}).addStringOption((option) => {
		return option.setName('end').setDescription(`The end date, format is DD MM YYYY, DD MM or DD`).setRequired(false);
	}),
	async execute(interaction) {
		const startString = interaction.options.getString('start')
		const endString = interaction.options.getString('end')
		const start = new Date(Date.now())
		const end = new Date(start.getTime() + (24 * 60 * 60 * 1000))
		const argsStart = startString ? startString.split(' ') : []
		const argsEnd = endString ? endString.split(' ') : []
		argsStart.length == 3 && start.setFullYear(argsStart[2])
		argsStart.length >= 2 && start.setMonth(argsStart[1] - 1)
		argsStart.length >= 1 && start.setDate(argsStart[0])
		argsEnd.length == 3 && end.setFullYear(argsEnd[2])
		argsEnd.length >= 2 && end.setMonth(argsEnd[1] - 1)
		argsEnd.length >= 1 && end.setDate(argsEnd[0])
		const data = await getRegisteredActivities(await getLogin(interaction.member.id), start, end);
		const fields = data.map((e) => ({
			name: e.acti_title,
			value: `${e.start.substring(8, 10)}/${e.start.substring(5, 7)} - ${e.start.substring(11, 16)} - ${e.room?.code ? e.room.code.split('/')[e.room.code.split('/').length - 1] : "No room"}`,
			inline: false
		}))

		const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Activities')
			.setFields(...fields)
		interaction.reply({ embeds: [embed] })
	}
}