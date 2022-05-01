const fetch = require("node-fetch")
const fs = require('fs')

async function addAutoLogin(autoLogin, discordID) {
	let logins = getLogins();
	logins[discordID] = autoLogin
	saveLogins(logins)
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

// const dashboardInfos = `${randomAutoLogin}/?format=json`
// const myInfos = `${randomAutoLogin}/user/?format=json`
// const myFlags = `${randomAutoLogin}/user/florian.garnier@epitech.eu/flags?format=json`
// const myBinomes = `${randomAutoLogin}/user/florian.garnier@epitech.eu/binome?format=json`
// const myMarks = `${randomAutoLogin}/user/florian.garnier%40epitech.eu/notes?format=json`
// const myNetsoul = `${randomAutoLogin}/user/florian.garnier%40epitech.eu/netsoul?format=json`
// const planning = `${randomAutoLogin}/planning/load?format=json&start=2022-03-01&end=2022-03-05`
// const modules = `${randomAutoLogin}/module/board?format=json&start=2022-03-01&end=2022-03-05`
// const myPlanning = `${randomAutoLogin}/planning/my-schedules?format=json&start=2022-03-01&end=2022-03-05`

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

async function getListProjects(autologin, start, end) {
	const infos = await getInfos(autologin)
	const response = await fetch(`${autologin}/module/board?format=json&start=${start.toISOString().split('T')[0]}&end=${end.toISOString().split('T')[0]}`)
	let json = await response.json()
	return json.filter((e) => e.semester === 0 || e.semester === infos.semester)
}

async function getListProjectRegistered(autologin, start, end) {
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

async function registerProject(autologin, module, city, activity) {
	const infos = await getInfos(autologin)
	const year = infos.scolaryear
	const response = await fetch(`${autologin}/module/${year}/${module}/${city}/${activity}/register?format=json`, {
		method: 'POST'
	});
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
	const response = await fetch(`${autologin}/module/${year}/${module}/${city}/${activity}/unregister?format=json`, {
		method: 'POST'
	});
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

module.exports = {
	addAutoLogin,
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
	unregisterProject
}