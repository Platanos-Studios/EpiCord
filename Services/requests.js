const fetch = require("node-fetch")
const fs = require('fs')
const { MessageActionRow, MessageButton } = require('discord.js');


async function addAutoLogin(autoLogin, discordID) {
	let logins = getLogins();
	logins[discordID] = autoLogin
	saveLogins(logins)
}

async function removeAutoLogin(discordID) {
	let logins = getLogins();
	delete logins[discordID]
	saveLogins(logins)
}

function saveConfig(config) {
	fs.writeFileSync("./config.json", JSON.stringify(config), null, 2, (e) => e && console.log(e));
}

function getConfig() {
	let config = {}
	try {
		config = require('../config.json')
	} catch (e) {
		fs.writeFileSync("./config.json", JSON.stringify(config), null, 2, (e) => e && console.log(e));
	}
	return config;
}

function getLogins() {
	let fileLogins = {}
	try {
		fileLogins = require('../logins.json')
	} catch (e) {
		fs.writeFileSync("./logins.json", JSON.stringify(fileLogins), null, 2, (e) => e && console.log(e));
	}
	return fileLogins;
}

function getLogin(discordID) {
	let logins = getLogins();
	return logins[discordID]
}

function saveLogins(logins) {
	fs.writeFileSync("./logins.json", JSON.stringify(logins), null, 2, (e) => e && console.log(e));
}

async function testLogin(login) {
	const response = await fetch(`${login}/?format=json`)
	return response.status == 200
}

async function getDashboardInfos(autologin) {
	const response = await fetch(`${autologin}/?format=json`)
	let json = await response.json()
	return json;
}

async function getInfos(autologin) {
	const response = await fetch(`${autologin}/user/?format=json`)
	let json = await response.json()
	return json;
}

async function getFlags(autologin, user) {
	const response = await fetch(`${autologin}/user/${user}/flags?format=json`)
	let json = await response.json()
	return json;
}

async function getBinomes(autologin, user) {
	const response = await fetch(`${autologin}/user/${user}/binome?format=json`)
	let json = await response.json()
	return json;
}

async function getMarks(autologin, user) {
	const response = await fetch(`${autologin}/user/${user}/notes?format=json`)
	let json = await response.json()
	return json;
}

async function getNetsoul(autologin, user) {
	const response = await fetch(`${autologin}/user/${user}/netsoul?format=json`)
	let json = await response.json()
	return json;
}

async function getPlanning(autologin, start = new Date(Date.now()), end = new Date(start.getTime() + (24 * 60 * 60 * 1000))) {
	const response = await fetch(`${autologin}/planning/load?format=json&start=${start.toISOString().split('T')[0]}&end=${end.toISOString().split('T')[0]}`)
	let json = await response.json()
	return json;
}

async function getProjectInformations(autologin, module, city, acti) {
	const infos = await getInfos(autologin)
	const year = infos.scolaryear
	const response = await fetch(`${autologin}/module/${year}/${module}/${city}/${acti}/project/?format=json`)
	let json = await response.json()
	return json
}

async function getModuleInformations(autologin, module, city) {
	const infos = await getInfos(autologin)
	const year = infos.scolaryear
	const response = await fetch(`${autologin}/module/${year}/${module}/${city}/?format=json`)
	let json = await response.json()
	return json
}

async function getListProjects(autologin, start = new Date(Date.now()), end = new Date(start.getTime() + (24 * 60 * 60 * 1000))) {
	const infos = await getInfos(autologin)
	const response = await fetch(`${autologin}/module/board?format=json&start=${start.toISOString().split('T')[0]}&end=${end.toISOString().split('T')[0]}`)
	let json = await response.json()
	return json.filter((e) => {
		const semester = e.codeinstance.split('-')[1]
		return semester == 0 || semester == infos.semester
	})
}

async function getListProjectRegistered(autologin, start = new Date(Date.now()), end = new Date(start.getTime() + (24 * 60 * 60 * 1000))) {
	const response = await fetch(`${autologin}/module/board?format=json&start=${start.toISOString().split('T')[0]}&end=${end.toISOString().split('T')[0]}`)
	let json = await response.json()
	return json.filter((e) => e.registered)
}

async function getActivities(autologin, start = new Date(Date.now()), end = new Date(start.getTime() + (24 * 60 * 60 * 1000))) {
	const infos = await getInfos(autologin)
	const response = await fetch(`${autologin}/planning/load?format=json&start=${start.toISOString().split('T')[0]}&end=${end.toISOString().split('T')[0]}`)
	let json = await response.json()
	return json.filter((e) => e.semester === 0 || e.semester === infos.semester)
}

async function getModuleRegisteredActivities(autologin, start = new Date(Date.now()), end = new Date(start.getTime() + (24 * 60 * 60 * 1000))) {
	const response = await fetch(`${autologin}/planning/load?format=json&start=${start.toISOString().split('T')[0]}&end=${end.toISOString().split('T')[0]}`)
	let json = await response.json()
	return json.filter((e) => e.module_registered)
}

async function getRegisteredActivities(autologin, start = new Date(Date.now()), end = new Date(start.getTime() + (24 * 60 * 60 * 1000))) {
	const response = await fetch(`${autologin}/planning/load?format=json&start=${start.toISOString().split('T')[0]}&end=${end.toISOString().split('T')[0]}`)
	let json = await response.json()
	try {
		return json.filter((e) => e.event_registered == "registered" || e.event_registered == "present" || e.event_registered == "absent")
	} catch (e) {
		return []
	}
}

async function getEvent(autologin, module, city, activity, event) {
	const infos = await getInfos(autologin)
	const year = infos.scolaryear
	const response = await fetch(`${autologin}/module/${year}/${module}/${city}/${activity}/${event}/?format=json`)
	let json = await response.json()
	return json
}

async function registerModule(autologin, module, city) {
	const infos = await getInfos(autologin)
	const year = infos.scolaryear
	const response = await fetch(`${autologin}/module/${year}/${module}/${city}/register?format=json`, {
		method: 'POST'
	});
	return response
}

async function informChannelActivity(user, guild, currentActivity) {
	const config = getConfig()
	const channelID = config[guild.id]
	if (!channelID)
		return;
	const channel = guild.channels.cache.get(channelID)
	const row = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(`${currentActivity.codemodule}§${currentActivity.codeinstance}§${currentActivity.codeacti}§${currentActivity.codeevent}`)
			.setLabel("Register")
			.setStyle('PRIMARY')
	)
	const message = await channel.send({
		content: `@everyone, **${user.username}** just registered to **${currentActivity.acti_title}**, you can also register by clicking on the button below`,
		components: [row]
	})
	const collector = message.createMessageComponentCollector({ componentType: 'BUTTON', time: 60000 * 30 })
	collector.on('collect', async i => {
		const userLogin = await getLogin(i.user.id);
		const args = i.customId.split('§')
		let res = await registerEvent(userLogin, args[0], args[1], args[2], args[3])
		await i.reply(res.status === 200 ? `Successfully Registered` : `Error: ${res.statusText}`)
	})
}

async function informChannelProject(user, guild, currentProject) {
	const config = getConfig()
	const channelID = config[guild.id]
	if (!channelID)
		return;
	const channel = guild.channels.cache.get(channelID)
	const row = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(`${currentProject.codemodule}§${currentProject.codeinstance}§${currentProject.codeacti}`)
			.setLabel("Register")
			.setStyle('PRIMARY')
	)
	const message = await channel.send({
		content: `@everyone, **${user.username}** just registered to **${currentProject.title}**, you can also register by clicking on the button below`,
		components: [row]
	})
	const collector = message.createMessageComponentCollector({ componentType: 'BUTTON', time: 60000 * 30 })
	collector.on('collect', async i => {
		const userLogin = await getLogin(i.user.id);
		const args = i.customId.split('§')
		let res = await registerProject(userLogin, args[0], args[1], args[2])
		await i.reply(res.status === 200 ? `Successfully Registered` : `Error: ${res.statusText}`)
	})
}

async function informChannelModule(user, guild, currentModule) {
	const config = getConfig()
	const channelID = config[guild.id]
	if (!channelID)
		return;
	const channel = guild.channels.cache.get(channelID)
	const row = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(`${currentModule.codemodule}§${currentModule.codeinstance}`)
			.setLabel("Register")
			.setStyle('PRIMARY')
	)
	const message = await channel.send({
		content: `@everyone, **${user.username}** just registered to **${currentModule.title}**, you can also register by clicking on the button below`,
		components: [row]
	})
	const collector = message.createMessageComponentCollector({ componentType: 'BUTTON', time: 60000 * 30 })
	collector.on('collect', async i => {
		const userLogin = await getLogin(i.user.id);
		const args = i.customId.split('§')
		let res = await registerModule(userLogin, args[0], args[1])
		await i.reply(res.status === 200 ? `Successfully Registered` : `Error: ${res.statusText}`)
	})
}

async function registerProject(autologin, module, city, activity, members = [], groupTitle = "") {
	const infos = await getInfos(autologin)
	const year = infos.scolaryear
	let response = {}
	if (members.length === 0) {
		response = await fetch(`${autologin}/module/${year}/${module}/${city}/${activity}/project/register?format=json`, {
			method: 'POST'
		});
	} else {
		let str = ""
		members.forEach((e) => {
			str += `members%5B%5D=${e}&`
		})
		str += `title=${groupTitle}&force=false`
		response = await fetch(`${autologin}/module/${year}/${module}/${city}/${activity}/project/register?format=json`, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded"
			},
			method: 'POST',
			body: str
		});
	}
	return response
}

async function registerEvent(autologin, module, city, activity, event) {
	const infos = await getInfos(autologin)
	const year = infos.scolaryear
	const response = await fetch(`${autologin}/module/${year}/${module}/${city}/${activity}/${event}/register?format=json`, {
		method: 'POST'
	});
	return response
}

async function unregisterModule(autologin, module, city) {
	const infos = await getInfos(autologin)
	const year = infos.scolaryear
	const response = await fetch(`${autologin}/module/${year}/${module}/${city}/unregister?format=json`, {
		method: 'POST'
	});
	return response
}

async function unregisterProject(autologin, module, city, activity) {
	const infos = await getInfos(autologin)
	const year = infos.scolaryear
	let response = await fetch(`${autologin}/module/${year}/${module}/${city}/${activity}/unregister?format=json`, {
		method: 'POST'
	});
	if (response.status !== 200) {
		response = await fetch(`${autologin}/module/${year}/${module}/${city}/${activity}/destroygroup?format=json`, {
			method: 'POST'
		});
		if (response.status !== 200) {
			response = await fetch(`${autologin}/module/${year}/${module}/${city}/${activity}/leavegroup?format=json`, {
				method: 'POST'
			});
		}
	}
	return response
}

async function unregisterEvent(autologin, module, city, activity, event) {
	const infos = await getInfos(autologin)
	const year = infos.scolaryear
	const response = await fetch(`${autologin}/module/${year}/${module}/${city}/${activity}/${event}/unregister?format=json`, {
		method: 'POST'
	});
	return response
}

async function getModules(autologin, start = new Date(Date.now()), end = new Date(start.getTime() + (24 * 60 * 60 * 1000))) {
	const infos = await getInfos(autologin)
	const year = infos.scolaryear
	const response = await fetch(`${autologin}/course/filter?format=json&preload=1&location[]=${infos.location.split('/')[0]},${infos.location}&course[]=${infos.course_code}&scolaryear[]=${year}`)
	const json = await response.json()
	return json.items.filter((e) => {
		const dateStart = new Date(e.begin)
		const dateEnd = new Date(e.end)

		return (start.getTime() <= dateEnd.getTime() && start.getTime() >= dateStart.getTime()) || (end.getTime() <= dateEnd.getTime() && end.getTime() >= dateStart.getTime())
	})
}

async function getModulesRegistered(autologin, start = new Date(Date.now()), end = new Date(start.getTime() + (24 * 60 * 60 * 1000))) {
	const infos = await getInfos(autologin)
	const year = infos.scolaryear
	const response = await fetch(`${autologin}/course/filter?format=json&preload=1&location[]=${infos.location.split('/')[0]},${infos.location}&course[]=${infos.course_code}&scolaryear[]=${year}`)
	const json = await response.json()
	return json.items.filter((e) => {
		const dateStart = new Date(e.begin)
		const dateEnd = new Date(e.end)

		return e.status !== 'notregistered' && ((start.getTime() <= dateEnd.getTime() && start.getTime() >= dateStart.getTime()) || (end.getTime() <= dateEnd.getTime() && end.getTime() >= dateStart.getTime()))
	})
}

module.exports = {
	addAutoLogin,
	removeAutoLogin,
	getDashboardInfos,
	getInfos,
	getFlags,
	getBinomes,
	getMarks,
	getNetsoul,
	getPlanning,
	getActivities,
	getEvent,
	getModuleRegisteredActivities,
	getRegisteredActivities,
	getModuleInformations,
	getProjectInformations,
	getListProjectRegistered,
	getListProjects,
	getLogin,
	saveLogins,
	testLogin,
	registerEvent,
	registerModule,
	registerProject,
	unregisterEvent,
	unregisterModule,
	unregisterProject,
	getConfig,
	saveConfig,
	informChannelActivity,
	informChannelModule,
	informChannelProject,
	getModules,
	getModulesRegistered
}