require('dotenv').config();
const OpenAI = require('openai');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const fetch = require('node-fetch');
const { Client, GatewayIntentBits, Partials } = require('discord.js');

// Initialize OpenAI and Discord client
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

// Log in to Discord
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Convert audio file format
async function convertAudio(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputFile)
            .output(outputFile)
            .on('end', resolve)
            .on('error', reject)
            .run();
    });
}

// Generate a response using the GPT model
async function generateResponse(prompt) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{"role": "user", "content": prompt}],
            max_tokens: 1024
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error generating response:', error.response ? error.response.data : error);
        return 'Error generating response.';
    }
}

// Generate an image using the DALL-E model
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

// Handle incoming messages
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!image')) {
        const prompt = message.content.slice('!image'.length).trim();
        await generateImage(prompt, message);
    } else if (message.content.startsWith('!tts')) {
        const prompt = message.content.slice('!tts'.length).trim();
        const chatResponse = await generateResponse(prompt);
        const ttsResponse = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'nova',
            input: chatResponse,
        });
        const audioBuffer = await ttsResponse.buffer();
        const audioResponse = { files: [{ attachment: audioBuffer, name: 'response.mp3' }] };
        message.channel.send(audioResponse);
    } else if (message.attachments.first() && message.attachments.first().name.endsWith('.ogg')) {
        const attachment = message.attachments.first();
        const audioBuffer = await fetch(attachment.url).then(res => res.buffer());
        await fs.promises.writeFile('audio.ogg', audioBuffer);
        await convertAudio('audio.ogg', 'audio.mp3');
        const whisperResponse = await openai.audio.transcriptions.create({
            model: 'whisper-1',
            file: fs.createReadStream('audio.mp3'),
        });
        const transcription = whisperResponse.text;
        const chatResponse = await generateResponse(transcription);
        const ttsResponse = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'nova',
            input: chatResponse,
        });
        const audioBuffer2 = await ttsResponse.buffer();
        const audioResponse = { files: [{ attachment: audioBuffer2, name: 'response.mp3' }] };
        message.channel.send(audioResponse);
    } else {
        const response = await generateResponse(message.content);
        message.channel.send(response);
    }
});

// Log in to Discord
client.login(process.env.DISCORD_BOT_TOKEN);