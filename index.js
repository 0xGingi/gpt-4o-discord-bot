require('dotenv').config();
const OpenAI = require('openai');
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

    const response = await generateResponse(message.content);
    message.channel.send(response);
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

client.login(process.env.DISCORD_BOT_TOKEN);