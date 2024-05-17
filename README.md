Simple Discord Bot that uses OPENAI API Key, change model/base prompt to whatever you want

* /chat - send chatgpt a message
* /image - generate a image
* /tts - get your chatgpt response in tts
* /audio - First send a audio file or voice message, the bot will transcribe that audio file, generate a response, and send back the response in tts

## Installation (REQUIRES FFMPEG AND NODEJS)
```git clone https://github.com/0xGingi/gpt-4o-discord-bot && cd gpt-4o-discord-bot```

```npm install```

```cp example.env .env```
(Modify .env now)

```node deploy-commands.js```

```node index.js```
