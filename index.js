const { Client, GatewayIntentBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, LIVE_CHANNEL_ID, ADMIN_ID, BOT_TOKEN } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences, 
        GatewayIntentBits.GuildMembers    
    ]
});

// --- TWITCH API HELFER-FUNKTIONEN ---
async function getTwitchToken() {
    const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`, {
        method: 'POST'
    });
    const data = await response.json();
    return data.access_token;
}

async function getLiveStreams(token, dynamicStreamers) {
    if (dynamicStreamers.length === 0) return [];
    const safeList = dynamicStreamers.slice(0, 100);
    const query = safeList.map(name => `user_login=${name}`).join('&');
    
    const response = await fetch(`https://api.twitch.tv/helix/streams?${query}`, {
        headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    return data.data; 
}

function getUptime(startedAt) {
    const start = new Date(startedAt);
    const now = new Date();
    const diff = now - start; 
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}min`;
}

// --- TWITCH LOGIK ---
let liveMessageId = null;

async function updateTwitchLiveMessage() {
    try {
        const channel = await client.channels.fetch(LIVE_CHANNEL_ID);
        if (!channel) return;

        if (!liveMessageId) {
            const fetchedMessages = await channel.messages.fetch({ limit: 20 });
            const lastBotMessage = fetchedMessages.find(msg => msg.author.id === client.user.id);
            if (lastBotMessage) liveMessageId = lastBotMessage.id;
        }

        const guild = channel.guild;
        const activeStreamers = [];

        guild.presences.cache.forEach(presence => {
            const streamingActivity = presence.activities.find(activity => activity.type === 1);

            if (streamingActivity && streamingActivity.url && streamingActivity.url.includes('twitch.tv')) {
                const twitchName = streamingActivity.url.split('/').filter(Boolean).pop();
                if (twitchName && !activeStreamers.includes(twitchName.toLowerCase())) {
                    activeStreamers.push(twitchName.toLowerCase());
                }
            }
        });

        let embedDescription = '';
        if (activeStreamers.length === 0) {
            embedDescription = 'Aktuell ist leider niemand aus der Community live. 😴';
        } else {
            const token = await getTwitchToken();
            let liveStreams = await getLiveStreams(token, activeStreamers);

            if (liveStreams.length === 0) {
                 embedDescription = 'Aktuell ist leider niemand aus der Community live. 😴';
            } else {
                liveStreams.sort((a, b) => b.viewer_count - a.viewer_count);
                liveStreams.forEach(stream => {
                    const uptime = getUptime(stream.started_at);
                    embedDescription += `**[${stream.user_name}](https://twitch.tv/${stream.user_name})**: *"${stream.title}"*\n`;
                    embedDescription += `**${stream.game_name}** - \`${stream.viewer_count} Zuschauer\` - \`Live seit ${uptime}\`\n\n`; 
                });
            }
        }

        const liveEmbed = new EmbedBuilder()
            .setColor('#9146FF')
            .setTitle('Schau dir die Streams der Community-Mitglieder an und lass etwas Liebe da!')
            .setThumbnail('https://cdn3.iconfinder.com/data/icons/popular-services-brands-vol-2/512/twitch-512.png')
            .setDescription(embedDescription);

        if (liveMessageId) {
            const messageToUpdate = await channel.messages.fetch(liveMessageId);
            await messageToUpdate.edit({ embeds: [liveEmbed] });
            console.log(`🔄 Live-Daten aktualisiert!`);
        } else {
            const newMessage = await channel.send({ embeds: [liveEmbed] });
            liveMessageId = newMessage.id;
            console.log(`✅ Neue Live-Nachricht erstellt!`);
        }
    } catch (error) {
        console.error('Fehler beim Twitch-Update:', error);
    }
}

// --- EVENTS ---
client.once('ready', async () => {
    console.log(`🤖 Bot online: ${client.user.tag}`);
    
    try {
        const channel = await client.channels.fetch(LIVE_CHANNEL_ID);
        if (channel && channel.guild) {
            console.log('📦 Befülle Presence-Cache einmalig beim Start...');
            await channel.guild.members.fetch({ withPresences: true });
            console.log('✅ Cache erfolgreich aufgebaut!');
        }
    } catch (error) {
        console.error('Fehler beim initialen Cache-Fetch:', error);
    }

    updateTwitchLiveMessage();
    setInterval(updateTwitchLiveMessage, 5 * 60 * 1000); 
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    
    if (interaction.commandName === 'updatestreams') {
        try {
            if (interaction.user.id !== ADMIN_ID) {
                return interaction.reply({ content: '⛔ Keine Rechte.', flags: MessageFlags.Ephemeral });
            }

            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            await updateTwitchLiveMessage();
            await interaction.editReply({ content: '✅ Twitch-Daten erfolgreich aktualisiert.' });
            
        } catch (error) {
            console.error('Fehler beim manuellen Update:', error);
            if (interaction.deferred) {
                await interaction.editReply({ content: '❌ Fehler beim Aktualisieren der Streams.' });
            }
        }
    }
});

client.login(BOT_TOKEN);
