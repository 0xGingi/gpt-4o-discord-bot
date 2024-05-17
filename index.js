require('dotenv').config();
const OpenAI = require('openai');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const fetch = require('node-fetch');
const { Client, SlashCommandBuilder, Collection, Events, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
require('events').EventEmitter.prototype._maxListeners = 200;

const openai = new OpenAI({ apiKey: process.env.GPT_API_KEY });

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel, Partials.Message, Partials.GuildMember]
});
client.commands = new Collection();

async function convertAudio(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputFile)
            .output(outputFile)
            .on('end', resolve)
            .on('error', reject)
            .run();
    });
}
async function generateResponse(prompt) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{"role": "user", "content": prompt}],
            //use this instead if you would like a system prompt
            //messages: [{role: 'system', content: 'You are Bobby Hill'},{"role": "user", "content": prompt}],
            max_tokens: 1024
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error generating response:', error.response ? error.response.data : error);
        return 'Error generating response.';
    }
}
async function generateImage(prompt, message) {
    try {
        const openaiResponse = await openai.images.generate({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1024x1024',
        });
        const imageUrl = openaiResponse.data[0].url;
        const fetchResponse = await fetch(imageUrl);
        const buffer = await fetchResponse.buffer();
        const image = { files: [{ attachment: buffer, name: 'image.png' }] };
        message.channel.send(image);
    } catch (error) {
        console.error('Error generating image:', error.response ? error.response.data : error);
        message.channel.send('Error generating image.');
    }
}

module.exports = {client, convertAudio, generateResponse, generateImage, openai};
client.commands = new Collection();
const { loadCommands } = require('./Commands');

client.once('ready', async () => {
    console.log('');
    await loadCommands(client);
    await client.user.setPresence({
        activities: [{name :'ChatGPT', type: ActivityType.Playing }],
        status: `online`,
    });
});

client.on('interactionCreate', async interaction => {
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

client.login(process.env.DISCORD_BOT_TOKEN);

process.on('unhandledRejection', (err, origin) => {
    console.log('Error.\n', err.stack);
});

process.on('uncaughtException', (err, origin) => {
    console.log('Error.\n', err.stack);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log('Error.\n', err.stack);
});