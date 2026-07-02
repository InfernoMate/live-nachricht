const { REST, Routes } = require('discord.js');
const { BOT_TOKEN, CLIENT_ID, GUILD_ID } = require('./config.json');

const commands = [
    {
        name: 'updatestreams',
        description: 'Aktualisiert die Twitch-Live-Anzeige manuell',
    }
];

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

(async () => {
    try {
        console.log('Starte das Aktualisieren der Slash-Befehle...');
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );
        console.log('Slash-Befehle erfolgreich registriert!');
    } catch (error) {
        console.error(error);
    }
})();
