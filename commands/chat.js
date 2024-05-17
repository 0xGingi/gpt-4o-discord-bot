const { SlashCommandBuilder } = require('discord.js');
const { generateResponse, openai } = require('../index.js');

module.exports = {
    info: {
        names: ['chat']
    },
    data: new SlashCommandBuilder()
        .setName('chat')
        .setDescription('Chat with ChatGPT')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true)),
                async execute(interaction) {        
                    const message = interaction.options.getString('message');
                    await interaction.deferReply();
                    const response = await generateResponse(message);
                    await interaction.editReply(response);
                },
            };