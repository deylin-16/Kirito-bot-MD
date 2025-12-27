const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"))
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import { Boom } from '@hapi/boom'
const { exec } = await import('child_process')
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (!(global.conns instanceof Array)) global.conns = []

let m_code = (botJid) => {
    const config = global.getAssistantConfig(botJid) || { 
        assistantName: 'Sub-Bot', 
        assistantImage: 'https://www.deylin.xyz/logo.jpg' 
    };
    const isBuffer = Buffer.isBuffer(config.assistantImage);
    return {
        contextInfo: {
            externalAdReply: {
                title: `CÓDIGO DE EMPAREJAMIENTO`,
                body: `Asistente: ${config.assistantName}`,
                mediaType: 1,
                previewType: 'PHOTO',
                renderLargerThumbnail: true,
                ...(isBuffer ? { thumbnail: config.assistantImage } : { thumbnailUrl: config.assistantImage }),
                sourceUrl: 'https://www.deylin.xyz/1' 
            }
        }
    };
};

let handler = async (m, { conn, usedPrefix, command }) => {
    if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) return m.reply(`El comando *${command}* está desactivado.`)
    let socklimit = global.conns.filter(sock => sock?.user).length
    if (socklimit >= 50) return m.reply(`No hay espacios disponibles.`)
    
    let phoneNumber = m.sender.split('@')[0]
    let pathAssistantAccess = path.join(`./${jadi}/`, phoneNumber)
    if (!fs.existsSync(pathAssistantAccess)) fs.mkdirSync(pathAssistantAccess, { recursive: true })
    
    assistant_accessJadiBot({ pathAssistantAccess, m, conn, usedPrefix, command, phoneNumber, fromCommand: true })
}

handler.command = ['conectar_assistant', 'conectar']
export default handler 

export async function assistant_accessJadiBot(options) {
    let { pathAssistantAccess, m, conn, phoneNumber, fromCommand } = options
    let isPairingSent = false 

    const { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(pathAssistantAccess)

    const connectionOptions = {
        logger: pino({ level: "fatal" }),
        printQRInTerminal: false,
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'fatal'})) 
        },
        browser: ['Windows', 'Firefox'],
        version: version
    }

    let sock = makeWASocket(connectionOptions)

    async function connectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update

        if (qr && !sock.authState.creds.registered && fromCommand && !isPairingSent) {
            isPairingSent = true 
            setTimeout(async () => {
                try {
                    let secret = await sock.requestPairingCode(phoneNumber)
                    secret = secret.match(/.{1,4}/g)?.join("-")
                    await conn.sendMessage(m.chat, { text: secret, ...m_code(conn.user.jid) }, { quoted: m })
                } catch (e) {
                    isPairingSent = false 
                }
            }, 3000)
        }

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            if (reason !== DisconnectReason.loggedOut) {
                assistant_accessJadiBot(options) 
            } else {
                try { fs.rmSync(pathAssistantAccess, { recursive: true, force: true }) } catch {}
                global.conns = global.conns.filter(s => s.user?.jid !== sock.user?.jid)
            }
        }

        if (connection === 'open') {
            sock.isInit = true
            if (!global.conns.includes(sock)) global.conns.push(sock)
            await conn.sendMessage(m.chat, { text: `✅ Sub-Bot conectado: @${phoneNumber}`, mentions: [`${phoneNumber}@s.whatsapp.net`] }, { quoted: m })
        }
    }

    sock.ev.on("connection.update", connectionUpdate)
    sock.ev.on("creds.update", saveCreds)
    
    let handlerImport = await import('../handler.js')
    sock.ev.on("messages.upsert", handlerImport.handler.bind(sock))
}
