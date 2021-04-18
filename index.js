const {
    WAConnection,
    MessageType
} = require("@adiwajshing/baileys");
const fs = require("fs");

const prefix = "!"

async function connectToWhatsApp() {
    const conn = new WAConnection();

    fs.existsSync('./session.json') && conn.loadAuthInfo('./session.json');
    await conn.connect();
    fs.writeFileSync('./session.json', JSON.stringify(conn.base64EncodedAuthInfo(), null, '\t'));

    conn.on('chat-update', async (chat) => {
        try {
            if (!chat.hasNewMessage) return;
            chat = chat.messages.all()[0];
            if (!chat.message) return;
            if (chat.key && chat.key.remoteJid == 'status@broadcast') return;
            if (chat.key.fromMe) return;
            const from = chat.key.remoteJid;
            const type = Object.keys(chat.message)[0];
            body = (type === 'conversation' && chat.message.conversation.startsWith(prefix)) ? chat.message.conversation : (type == 'imageMessage') && chat.message.imageMessage.caption.startsWith(prefix) ? chat.message.imageMessage.caption : (type == 'videoMessage') && chat.message.videoMessage.caption.startsWith(prefix) ? chat.message.videoMessage.caption : (type == 'extendedTextMessage') && chat.message.extendedTextMessage.text.startsWith(prefix) ? chat.message.extendedTextMessage.text : ''
            const command = body.split(/ +/).shift().toLowerCase()

            switch (command) {
                case prefix + "tes":
                    conn.sendMessage(from, "OK", MessageType.text);
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
