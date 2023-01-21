const { App } = require('@slack/bolt');
const parseDuration = require('parse-duration')

const app = new App({
    token: process.env.HM_SLACK_BEARER_TOKEN,
    signingSecret: process.env.HM_SLACK_SIGNING_SECRET
});

const sendMessage = process.env.HM_SEND_MESSAGE;
const archiveChannels = process.env.HM_ARCHIVE_CHANNELS;
const channelRegex = process.env.HM_CHANNEL_REGEX;
const lastMessageMaxAge = parseDuration(process.env.HM_LAST_MESSAGE_MAX_AGE);
console.log(`Archiving channels matching ${channelRegex} with no activity for ${lastMessageMaxAge}ms`);

const now = Date.now();

(async () => {
    const result = await app.client.conversations.list({exclude_archived: true});
    const channels = result.channels;
    const matchingChannels = channels.filter(c => c.name.match(channelRegex) != null);
    await Promise.all(matchingChannels.map(async (c) => {
        const channelName = `${c.name} (${c.id})`;
        if (c.is_channel) {
            if (!c.is_member) {
                console.log(`Joining channel ${channelName}`);
                await app.client.conversations.join({channel: c.id});
            }
            console.log(`Getting latest message from channel ${channelName}`);
            const messages = await app.client.conversations.history({channel: c.id, limit: 2});
            let lastMessage = messages.messages[0];
            if (lastMessage.subtype === 'channel_join' && messages.messages.length > 1) {
                // If the most recent message is someone joining, it might be us, so we look at the last but one message
                lastMessage = messages.messages[1]
            }
            const lastMessageTs = lastMessage.ts * 1000; // we want ms precision
            const lastMessageAge = now - lastMessageTs;
            if (lastMessageAge > lastMessageMaxAge) {
                console.log(`In channel ${channelName}, the last message is ${lastMessageAge}ms old (max age = ${lastMessageMaxAge}ms)`);
                if (sendMessage === 'true') {
                    console.log(`Sending message to channel ${channelName}`);
                    await app.client.chat.postMessage({
                        channel: c.id,
                        text: `I am archiving #${c.name} because it has been inactive for a while. Please unarchive the channel and reach out to my owner if this was a mistake!`
                    })
                }
                if (archiveChannels === 'true') {
                    console.log(`Archiving channel ${channelName}`);
                    await app.client.conversations.archive({channel: c.id});
                }
            } else {
                console.log(`Not doing anything with ${channelName}, as there is still recent activity`)
            }
        }
    }));
})();