const { SlashCommandBuilder } = require('discord.js');
const { generateResponse, openai } = require('../index.js');

module.exports = {
    info: {
        names: ['tts']
    },
    data: new SlashCommandBuilder()
        .setName('tts')
        .setDescription('Get a response as TTS')
        .addStringOption(option =>
            option.setName('tts')
                .setDescription('The message to send')
                .setRequired(true)),
    async execute(interaction) {        
        const text = interaction.options.getString('tts');
        await interaction.deferReply();
        const chatResponse = await generateResponse(text);
        const ttsResponse = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'nova',
            input: chatResponse,
        });
        const audioBuffer = await ttsResponse.buffer();
        await interaction.editReply({ files: [{ attachment: audioBuffer, name: 'response.mp3' }] });
    },
};