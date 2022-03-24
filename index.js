const Discord = require("discord.js");
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });
const config = require("./config.json");
const fs = require("fs");

require("dotenv").config();

const commandsFolder = fs.readdirSync("./Commands");
client.commands = new Discord.Collection();

for (const folder of commandsFolder) {
   const commandsFiles = require(`./Commands/${folder}`).filter(file => file.endsWith(".js"));
   for (const file of commandsFiles) {
       const command = require(`./Commands/${folder}/${file}`);
       client.commands.set(command.data.name, command);
   }
}

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