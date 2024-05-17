const { SlashCommandBuilder } = require('discord.js');
const { generateResponse, openai, convertAudio } = require('../index.js');
const fetch = require('node-fetch');
const fs = require('fs');

module.exports = {
    info: {
        names: ['audio']
    },
    data: new SlashCommandBuilder()
        .setName('audio')
        .setDescription('Generate TTS Response from recently sent audio/voice message'),
        async execute(interaction) {        
            await interaction.deferReply();

            const messages = await interaction.channel.messages.fetch({ limit: 5 });
            const audioExtensions = ['.wav', '.mp3', '.aac', '.ogg', '.wma', '.flac', '.alac', '.m4a'];
            const messageWithAudio = messages.find(m => 
                m.attachments.first() && 
                audioExtensions.some(ext => m.attachments.first().name.toLowerCase().endsWith(ext))
            );
            if (!messageWithAudio) {
                await interaction.editReply('No recent audio file found.');
                return;
            }
        
            const attachment = messageWithAudio.attachments.first();
            const audioBuffer = await fetch(attachment.url).then(res => res.buffer());
            const extension = audioExtensions.find(ext => attachment.name.toLowerCase().endsWith(ext));
            await fs.promises.writeFile(`audio.${extension}`, audioBuffer);
            await convertAudio(`audio.${extension}`, 'audio.mp3');
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
            await interaction.editReply({ files: [{ attachment: audioBuffer2, name: 'response.mp3' }] });
        },
        };