const {
    WAConnection,
    MessageType
} = require("@adiwajshing/baileys");
const fs = require("fs");
const ffmpeg = require('fluent-ffmpeg');

const prefix = "!"
const pesan = {
    kesalahan: "*TERJADI KESALAHAN*"
}

function randInt(format) {
    return `${Math.floor(Math.random() * 55555)}${format}`
}

async function connectToWhatsApp() {
    const conn = new WAConnection();

    fs.existsSync('./session.json') && conn.loadAuthInfo('./session.json');
    await conn.connect();
    fs.writeFileSync('./session.json', JSON.stringify(conn.base64EncodedAuthInfo()));

    conn.on('chat-update', async (chat) => {
        try {
            if (!chat.hasNewMessage) return;
            chat = chat.messages.all()[0];
            if (!chat.message) return;
            if (chat.key && chat.key.remoteJid == 'status@broadcast') return;
            if (chat.key.fromMe) return;
            const from = chat.key.remoteJid;
            const type = Object.keys(chat.message)[0];
            const content = JSON.stringify(chat.message);
            body = (type === 'conversation' && chat.message.conversation.startsWith(prefix)) ? chat.message.conversation : (type == 'imageMessage') && chat.message.imageMessage.caption.startsWith(prefix) ? chat.message.imageMessage.caption : (type == 'videoMessage') && chat.message.videoMessage.caption.startsWith(prefix) ? chat.message.videoMessage.caption : (type == 'extendedTextMessage') && chat.message.extendedTextMessage.text.startsWith(prefix) ? chat.message.extendedTextMessage.text : ''
            const command = body.split(/ +/).shift().toLowerCase()

            const media = (type === 'imageMessage' || type === 'videoMessage');
            const mediaImage = type === 'extendedTextMessage' && content.includes('imageMessage');
            const mediaVideo = type === 'extendedTextMessage' && content.includes('videoMessage');

            switch (command) {
                case prefix + "tes":
                    conn.sendMessage(from, "OK", MessageType.text);
                    break;
                case prefix + "sticker":
                case prefix + "stiker":
                    if (media || mediaImage) {
                        const download = mediaImage ? JSON.parse(JSON.stringify(chat).replace("quotedM", "m")).message.extendedTextMessage.contextInfo : chat;
                        const gambar = await conn.downloadAndSaveMediaMessage(download);
                        fileName = randInt(".webp");
                        await ffmpeg(`./${gambar}`)
                            .input(gambar)
                            .on("error", function (error) {
                                console.log(error)
                                .then(() => fs.unlinkSync(gambar))
                                .then(() => conn.sendMessage(from, `${pesan.kesalahan}`, MessageType.text));
                            })
                            .on("end", function () {
                                conn.sendMessage(from, fs.readFileSync(fileName), MessageType.sticker)
                                .then(() => fs.unlinkSync(gambar))
                                .then(() => fs.unlinkSync(fileName));
                            })
                            .addOutputOptions([
                                `-vcodec`,
                                `libwebp`,
                                `-vf`,
                                `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=1, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff00 [p]; [b][p] paletteuse`,
                            ])
                            .save(fileName);
                    } else {
                        conn.sendMessage(from, `${pesan.kesalahan}`, MessageType.text);
                    }
                    break;
                case prefix + "sgif":
                case prefix + "stikergif":
                case prefix + "stickergif":
                    if (media || mediaVideo) {
                        const download = mediaVideo ? JSON.parse(JSON.stringify(chat).replace("quotedM", "m")).message.extendedTextMessage.contextInfo : chat;
                        const video = await conn.downloadAndSaveMediaMessage(download);
                        fileName = randInt(".webp");
                        await ffmpeg(`./${video}`)
                            .inputFormat(video.split(".")[1])
                            .on("error", function (error) {
                                console.log(error)
                                    .then(() => fs.unlinkSync(video))
                                    .then(() => conn.sendMessage(from, `${pesan.kesalahan}`, MessageType.text));
                            })
                            .on("end", function () {
                                conn.sendMessage(from, fs.readFileSync(fileName), MessageType.sticker)
                                    .then(() => fs.unlinkSync(video))
                                    .then(() => fs.unlinkSync(fileName));
                            })
                            .addOutputOptions([
                                `-vcodec`,
                                `libwebp`,
                                `-vf`,
                                `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=10, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff00 [p]; [b][p] paletteuse`,
                            ])
                            .save(fileName);
                    } else {
                        conn.sendMessage(from, `${pesan.kesalahan}`, MessageType.text);
                    }
                    break;
            }
        } catch (error) {
            console.log(error);
        }
    });
}
// run in main file
connectToWhatsApp()
    .catch(err => console.log("unexpected error: " + err)); // catch any errors
