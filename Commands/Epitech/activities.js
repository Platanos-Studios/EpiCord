const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { getRegisteredActivities, getLogin, getActivities, registerEvent, unregisterEvent, getConfig, informChannelActivity } = require("../../Services/requests.js")

module.exports = {
	data: new SlashCommandBuilder().setName('activities').setDescription('Gets the intra activities between two dates, default is today and tomorrow').addStringOption((option) => {
		return option.setName('start').setDescription(`The start date, format is DD MM YYYY, DD MM or DD`).setRequired(false);
	}).addStringOption((option) => {
		return option.setName('end').setDescription(`The end date, format is DD MM YYYY, DD MM or DD`).setRequired(false);
	}).addStringOption((option) => {
		return option.setName('activity').setDescription('The name of the activity').setRequired(false)
	}).addBooleanOption((option) => {
		return option.setName('registered').setDescription('Show only registered activities when activity parameter is empty').setRequired(false)
	}),
	async execute(interaction) {
		const startString = interaction.options.getString('start')
		const endString = interaction.options.getString('end')
		const activity = interaction.options.getString('activity')
		let registered = interaction.options.getBoolean('registered')
		if (registered === null)
			registered = true
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
		await interaction.deferReply()
		const login = await getLogin(interaction.member.id)
		const embed = new MessageEmbed().setColor('#0099ff')
		try {
			if (!activity) {
				const data = await (registered ? getRegisteredActivities(login, start, end) : getActivities(login, start, end));
				const fields = data.map((e) => ({
					name: e.acti_title,
					value: `${e.start.substring(8, 10)}/${e.start.substring(5, 7)} - ${e.start.substring(11, 16)} - ${e.room?.code ? e.room.code.split('/')[e.room.code.split('/').length - 1] : "No room"}`,
					inline: false
				}))
				embed.setTitle('Activities').setFields(...fields)
				await interaction.editReply({ embeds: [embed] })
			} else {
				const activities = await getActivities(login, start, end)
				const array = activities.filter((e) => e.acti_title.includes(activity) || e.codeevent.includes(activity))
				if (array.length > 1) {
					embed.setTitle('Multiple activites found, please retry with the code given below instead of the activity name')
						.addFields(array.map((e) => ({
							name: e.acti_title,
							value: `${e.start.substring(8, 10)}/${e.start.substring(5, 7)} - ${e.start.substring(11, 16)} - ${e.room?.code ? e.room.code.split('/')[e.room.code.split('/').length - 1] : "No room"}\nCode: ${e.codeevent.split('-')[1]}`,
							inline: false
						})))
					await interaction.editReply({ embeds: [embed] })
					return;
				}
				const currentActivity = array[0]
				embed.setTitle(currentActivity.acti_title)
					.setURL(`https://intra.epitech.eu/module/${currentActivity.scolaryear}/${currentActivity.codemodule}/${currentActivity.codeinstance}/${currentActivity.codeacti}/${currentActivity.codeevent}/registered`)
					.setDescription(`Date: ${currentActivity.start.substring(8, 10)}/${currentActivity.start.substring(5, 7)} - ${currentActivity.start.substring(11, 16)}
				Room: ${currentActivity.room?.code ? currentActivity.room.code.split('/')[currentActivity.room.code.split('/').length - 1] : "None"}`)
				if (Date.now() + (60 * 60 * 24 * 1000) > new Date(currentActivity.start).getTime()) {
					await interaction.editReply({ embeds: [embed] })
					return;
				}
				const row = new MessageActionRow().addComponents(
					new MessageButton()
						.setCustomId(`register§${currentActivity.codemodule}§${currentActivity.codeinstance}§${currentActivity.codeacti}§${currentActivity.codeevent}`)
						.setLabel("Register")
						.setStyle('PRIMARY'),
					new MessageButton()
						.setCustomId(`unregister§${currentActivity.codemodule}§${currentActivity.codeinstance}§${currentActivity.codeacti}§${currentActivity.codeevent}`)
						.setLabel("Unregister")
						.setStyle('DANGER')
				)
				const message = await interaction.editReply({ embeds: [embed], components: [row] })
				const collector = message.createMessageComponentCollector({ componentType: 'BUTTON', time: 60000 * 5 })
				collector.on('collect', async i => {
					const userLogin = await getLogin(i.user.id);
					const args = i.customId.split('§')
					let res = {}
					if (args[0] == 'register') {
						res = await registerEvent(userLogin, args[1], args[2], args[3], args[4])
						if (res.status === 200)
							informChannelActivity(i.user, i.guild, currentActivity)
					}
					else if (args[0] == 'unregister')
						res = await unregisterEvent(userLogin, args[1], args[2], args[3], args[4])
					await i.reply(res.status === 200 ? `Successfully ${args[0] == 'register' ? 'Registered' : 'Unregistered'}` : `Error: ${res.statusText}`)
				})
			}
		} catch (e) {
			console.log(e);
			await interaction.editReply('Command failed ! Try to check your arguments')
		}
	}
}