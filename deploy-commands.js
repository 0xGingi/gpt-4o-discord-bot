const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandItems = fs.readdirSync(foldersPath);

for (const item of commandItems) {
    const itemPath = path.join(foldersPath, item);
    let commandFiles;

    if (fs.statSync(itemPath).isDirectory()) {
        commandFiles = fs.readdirSync(itemPath).filter(file => file.endsWith('.js')).map(file => path.join(itemPath, file));
    } else if (item.endsWith('.js')) {
        commandFiles = [itemPath];
    } else {
        continue;
    }

    for (const file of commandFiles) {
        const command = require(file);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${file} is missing a required "data" or "execute" property.`);
        }

        if ('info' in command) {
            console.log(`[INFO] The command at ${file} has the following info: ${JSON.stringify(command.info)}`);
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();