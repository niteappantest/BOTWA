const {
    WAConnection
} = require("@adiwajshing/baileys");
const fs = require("fs");

async function connectToWhatsApp() {
    const conn = new WAConnection();

    fs.existsSync('./session.json') && conn.loadAuthInfo('./session.json');
    await conn.connect();
    fs.writeFileSync('./session.json', JSON.stringify(conn.base64EncodedAuthInfo(), null, '\t'));
}
// run in main file
connectToWhatsApp()
    .catch(err => console.log("unexpected error: " + err)); // catch any errors
