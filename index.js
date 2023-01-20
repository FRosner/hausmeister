const { App } = require('@slack/bolt');
const parseDuration = require('parse-duration')

const app = new App({
    token: process.env.SLACK_BEARER_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

const channelRegex = process.env.SLACK_CHANNEL_REGEX;
const lastMessageMaxAge = parseDuration(process.env.SLACK_LAST_MESSAGE_MAX_AGE);
console.log(`Archiving channels matching ${channelRegex} with no activity for ${lastMessageMaxAge}ms`);

const now = Date.now();

(async () => {
    const result = await app.client.conversations.list();
    const channels = result.channels;
    const matchingChannels = channels.filter(c => c.name.match(channelRegex) != null);
    await Promise.all(matchingChannels.map(async (c) => {
        const channelName = `${c.name} (${c.id})`;
        console.log(`Joining channel ${channelName}`);
        await app.client.conversations.join({channel: c.id});
        console.log(`Getting latest message from channel ${channelName}`);
        const messages = await app.client.conversations.history({channel: c.id, limit: 1});
        const lastMessageTs = messages.messages[0].ts * 1000; // we want ms precision
        const lastMessageAge = now - lastMessageTs;
        if (lastMessageAge > lastMessageMaxAge) {
            const archiveMsg = `Archiving channel ${channelName} as the last message is ${lastMessageAge}ms old (max age = ${lastMessageMaxAge}ms)`;
            console.log(archiveMsg);
            await app.client.chat.postMessage({
                channel: c.id,
                text: archiveMsg
            })
            await app.client.conversations.archive({channel: c.id});
        }
    }));
})();