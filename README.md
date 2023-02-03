# Hausmeister

## Description

Slack app to automatically archive Slack channels. For more context, see the [blog post](https://dev.to/frosnerd/hausmeister-automating-slack-channel-archiving-using-github-actions-3e5h).

## Usage

```bash
HM_SLACK_BEARER_TOKEN="xoxb-not-a-real-token" \
  HM_SLACK_SIGNING_SECRET="abcdefgnotarealsecret" \
  HM_CHANNEL_REGEX='^tmp-.*' \
  HM_LAST_MESSAGE_MAX_AGE='30d' \
  HM_ARCHIVE_CHANNELS='true' \
  HM_SEND_MESSAGE='true' \
  node index.js
```

## Slack Setup

### Required Scopes

- `channels:history`
- `channels:join`
- `channels:manage`
- `channels:read`
- `chat:write`
