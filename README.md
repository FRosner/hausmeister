# Hausmeister

## Description

Slack app to automatically archive Slack channels.

## Usage

```bash
SLACK_BEARER_TOKEN="xoxb-not-a-real-token" \
  SLACK_SIGNING_SECRET="abcdefgnotarealsecret" \
  SLACK_CHANNEL_REGEX='^tmp-.*' \
  SLACK_LAST_MESSAGE_MAX_AGE='30d' \
  node index.js
```

## Slack Setup

### Required Scopes

- `channels:history`
- `channels:join`
- `channels:manage`
- `channels:read`
- `chat:write`
