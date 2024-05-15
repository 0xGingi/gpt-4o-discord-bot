require('dotenv').config();
const OpenAI = require('openai');
const {Client,GatewayIntentBits,Partials} = require('discord.js');
const openai = new OpenAI({ apiKey: process.env.GPT_API_KEY});
const client = new Client({
    partials: [Partials.Channel, Partials.Message, Partials.GuildMember],
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates]
});

let data = {
    GPT_API_KEY: process.env.GPT_API_KEY,
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN
};

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const response = await generateResponse(message.content, data.GPT_API_KEY);
    message.channel.send(response);
});

async function generateResponse(prompt) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    "role": "system",
                    "content": "You are Bobby Hill, a twelve-year-old character from the TV show King of the Hill. You're a fun-loving, easygoing kid with a knack for comedy and drama. While you might not always meet your dad Hank’s expectations, you always follow your heart. Remember, you embrace being yourself, you're curious and sometimes naive, but you have a unique charm and wisdom that often surprises the people around you."
                },
                {"role": "user", "content": prompt}
            ],
            max_tokens: 1024
        });
        
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error generating response:', error.response ? error.response.data : error);
        return 'Thats my purse! I dont know you!';
    }
}

client.login(data.DISCORD_BOT_TOKEN);