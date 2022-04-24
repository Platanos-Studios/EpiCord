const fetch = require("node-fetch")
const fs = require('fs')

var logins = {}

async function addAutoLogin(autoLogin, discordID) {
	let login = await getInfos(autoLogin)
	logins[discordID] = {
		link: autoLogin,
		mail: login.mail
	}
}

function getLogin(discordID) {
	return logins[discordID]
}

function loadLogins() {
	try {
		const fileLogins = require('./logins.json');
		logins = JSON.parse(fileLogins);
	} catch (e) {}
}

function saveLogins() {
	console.log(logins)
	fs.writeFileSync("./logins.json", JSON.stringify(logins), null, 2, (e) => e && console.log(e));
}

async function testLogin(login) {
	const response = await fetch(`${login}`)
	return response.ok
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

async function getPlanning(autologin, start = new Date(), end = new Date()) {
	const response = await fetch(`${autologin}/planning/load?format=json&start=${start.toISOString().split('T')[0]}&end=${end.toISOString().split('T')[0]}`)
	let json = await response.json()
	return json;
}

async function getModuleRegisteredActivities(autologin, start = new Date(), end = new Date()) {
	const response = await fetch(`${autologin}/planning/load?format=json&start=${start.toISOString().split('T')[0]}&end=${end.toISOString().split('T')[0]}`)
	let json = await response.json()
	return json.filter((e) => e.module_registered == true)
}

async function getRegisteredActivities(autologin, start = new Date(), end = new Date()) {
	const response = await fetch(`${autologin}/planning/load?format=json&start=${start.toISOString().split('T')[0]}&end=${end.toISOString().split('T')[0]}`)
	let json = await response.json()
	return json.filter((e) => e.event_registered == "registered")
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
	getModuleRegisteredActivities,
	getRegisteredActivities,
	getLogin,
	loadLogins,
	saveLogins,
	testLogin
}