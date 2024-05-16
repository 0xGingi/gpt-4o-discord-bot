Simple Discord Bot that uses OPENAI API Key, change model/base prompt to whatever you want

* Responds to messages sent in channels
* Use !image to generate a image
* Voice Message Conversation (Send Voice Message -> FFMPEG Convert -> Whisper Transcribes -> Generates Response -> TTS)
* Please Note: This Listens to all messages in every channel it has permissions in by default, so either add a command and splice like I did with !image or manage your channel permissions properly!

## Installation (REQUIRES FFMPEG AND NODEJS)
```git clone https://github.com/0xGingi/gpt-4o-discord-bot && cd gpt-4o-discord-bot```

```npm install```

```cp example.env .env```
(Modify .env now)

```node index.js```
