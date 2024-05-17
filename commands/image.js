const { SlashCommandBuilder } = require('discord.js');
const { generateResponse, openai, generateImage } = require('../index.js');
const fetch = require('node-fetch');

module.exports = {
    info: {
        names: ['image']
    },
    data: new SlashCommandBuilder()
        .setName('image')
        .setDescription('Generate an image')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('The prompt for the image')
                .setRequired(true)),
    async execute(interaction) {        
        const prompt = interaction.options.getString('prompt');
        await interaction.deferReply();
        const deferReplyMessage = await interaction.fetchReply();
        await generateImage(prompt, interaction);
        deferReplyMessage.delete();
    },
};