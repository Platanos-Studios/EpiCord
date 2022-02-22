const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
    name: "shutdown",
    description: "Shuts down the bot",
    execute(message, args) {
        if (message.author.id !== "161198177758740480" || message.author.id !== "175948123183644672" || message.author.id !== "650432748275892253") {
            return message.channel.send("You are not authorized to use this command!");
        } else {
            message.channel.send("Shutting down...");
            process.exit();
        }
    }
}