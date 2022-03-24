const Discord = require("discord.js");
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require("fs");

require("dotenv").config();

let commands = [];
const commandsFolder = fs.readdirSync("./Commands");
client.commands = new Discord.Collection();

for (const folder of commandsFolder) {
	const commandFiles = fs.readdirSync(`./Commands/${folder}`).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const command = require(`./Commands/${folder}/${file}`);
		commands.push(command.data.toJSON());
		client.commands.set(command.data.name, command);
	}
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.clientId, process.env.guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

client.on('interactionCreate', async (interaction) => {
 	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(process.env.TOKEN);

client.on("ready", () => {
    console.log("Bot is online!")
    client.user.setActivity("Being constructed...", { type: "PLAYING" });
})
