require('dotenv').config();
const OpenAI = require('openai');
const { MessageOptions } = require('discord.js');
const fetch = require('node-fetch');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
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

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!image')) {
        const prompt = message.content.slice('!image'.length).trim();
        await generateImage(prompt, message);
    } else {
        const response = await generateResponse(message.content);
        message.channel.send(response);
    }
});

async function generateResponse(prompt) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                // Setup Prompt here is desired 
               //{"role": "system", "content": "You are a helpful assistant."}

                {"role": "user", "content": prompt}
            ],
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
        const image = {
            files: [{
                attachment: buffer,
                name: 'image.png'
            }]
        };

        message.channel.send(image);
    } catch (error) {
        console.error('Error generating image:', error.response ? error.response.data : error);
        message.channel.send('Error generating image.');
    }
}

client.login(process.env.DISCORD_BOT_TOKEN);