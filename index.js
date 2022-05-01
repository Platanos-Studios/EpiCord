const Discord = require("discord.js");
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require("fs");
const { loadLogins } = require("./Services/requests");

require("dotenv").config();

let commands = [];
let functions = {};
const commandsFolder = fs.readdirSync("./Commands");
client.commands = new Discord.Collection();

client.login(process.env.TOKEN);

for (const folder of commandsFolder) {
	const commandFiles = fs.readdirSync(`./Commands/${folder}`).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const command = require(`./Commands/${folder}/${file}`);
		commands.push(command.data.toJSON());
		functions[command.data.name] = command.execute;
	}
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	const command = functions[interaction.commandName];

	if (!command) return;

	try {
		await command(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on("ready", async (client) => {
	console.log("Bot is online!")
	try {
		await Promise.all(client.guilds.cache.map(async (e) => {
			await rest.put(Routes.applicationGuildCommands(process.env.clientId, e.id), { body: commands })
		}))
		console.log("Commands loaded");
	} catch (e) {
		console.log(e);
	}
	client.user.setActivity("Being constructed...", { type: "PLAYING" });
})
