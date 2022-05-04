const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { getListProjects, getLogin, getModuleInformations, getInfos, registerModule, getListProjectRegistered, unregisterModule, informChannelModule, getModulesRegistered, getModules } = require('../../Services/requests');

module.exports = {
	data: new SlashCommandBuilder().setName('modules').setDescription('Gets the current modules')
		.addStringOption((option) => {
			return option.setName('start').setDescription(`The start date, format is DD MM YYYY, DD MM or DD`).setRequired(false);
		})
		.addStringOption((option) => {
			return option.setName('end').setDescription(`The end date, format is DD MM YYYY, DD MM or DD`).setRequired(false);
		})
		.addStringOption((option) => {
			return option.setName('module').setDescription(`The module name`).setRequired(false);
		}).addBooleanOption((option) => {
			return option.setName('registered').setDescription(`Show only registered modules when module parameter is empty`).setRequired(false);
		}),
	async execute(interaction) {
		const startString = interaction.options.getString('start')
		const endString = interaction.options.getString('end')
		const moduleArg = interaction.options.getString('module')
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
		const embed = new MessageEmbed().setColor('#0099ff').setTitle('Fetching the data...')
		const message = await interaction.deferReply()
		const login = await getLogin(interaction.member.id)
		let fields = []

		try {
			if (!moduleArg) {
				const data = await (registered ? getModulesRegistered(login, start, end) : getModules(login, start, end))
				fields = data.map((e) => ({
					name: e.title,
					value: `${e.code}`,
					inline: false
				}))
				embed.setTitle('Current modules').setFields(...fields)
				await interaction.editReply({ embeds: [embed] })
			} else {
				const data = await getModules(login, start, end)
				fields = data
				let currentModuleList = fields.filter((e) => {
					return moduleArg && (e.title.includes(moduleArg) || e.code.includes(moduleArg) || e.codeinstance.includes(moduleArg))
				})
				if (currentModuleList.length > 1) {
					embed.setTitle('Multiple modules found, please retry with the code given below instead of the module name')
						.addFields(currentModuleList.map((e) => ({
							name: e.title,
							value: `Code: ${e.codeinstance}`,
							inline: false
						})))
					await interaction.editReply({ embeds: [embed] })
					return;
				}
				let currentModule = await getModuleInformations(login, currentModuleList[0].code, currentModuleList[0].codeinstance)
				embed.setTitle(currentModule.title).setDescription(`Start: ${currentModule.begin.substring(8, 10)}/${currentModule.begin.substring(5, 7)}
			End of inscription: ${currentModule.end_register.substring(8, 10)}/${currentModule.end_register.substring(5, 7)}
			End: ${currentModule.end.substring(8, 10)}/${currentModule.end.substring(5, 7)}
			Credits: ${currentModule.credits}
			${currentModule.student_grade != 'N/A' ? `\nGrade: ${currentModule.student_grade}` : ''}`)
					.setURL(`https://intra.epitech.eu/module/${currentModule.scolaryear}/${currentModule.codemodule}/${currentModule.codeinstance}`)
				if (Date.now() > new Date(currentModule.end_register).getTime()) {
					await interaction.editReply({ embeds: [embed] })
					return;
				}
				const row = new MessageActionRow().addComponents(
					new MessageButton()
						.setCustomId(`register§${currentModule.codemodule}§${currentModule.codeinstance}`)
						.setLabel("Register")
						.setStyle('PRIMARY'),
					new MessageButton()
						.setCustomId(`unregister§${currentModule.codemodule}§${currentModule.codeinstance}`)
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
						res = await registerModule(userLogin, args[1], args[2])
						if (res.status === 200)
							informChannelModule(i.user, i.guild, {
								codemodule: args[1],
								codeacti: args[2]
							})
					} else if (args[0] == 'unregister')
						res = await unregisterModule(userLogin, args[1], args[2])
					await i.reply(res.status === 200 ? `Successfully ${args[0] == 'register' ? 'Registered' : 'Unregistered'}` : `Error: ${res.statusText}`)
				})
			}
		} catch (e) {
			console.log(e);
			await interaction.editReply('Command failed ! Try to check your arguments')
		}
	}
}