import fetch from 'node-fetch';
import { sticker } from '../lib/sticker.js';

const GEMINI_API_KEY = 'AIzaSyD1V090ya1hDnW8ODQwdJ9RG5y8qK_Lmx0';
const MODEL_NAME = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;


let handler = m => m

handler.all = async function (m, { conn }) {
  let user = global.db.data.users[m.sender]
  let chat = global.db.data.chats[m.chat]

  const res = await fetch(`${kirito}/media/images/87411733_k.jpg`);
  const thumb2 = Buffer.from(await res.arrayBuffer());
  const userJid = m.sender;

  const fkontak = {
    key: { fromMe: false, participant: userJid },
    message: {
      imageMessage: {
        mimetype: 'image/jpeg',
        caption: '𝗥𝗘𝗦𝗣𝗨𝗘𝗦𝗧𝗔 > 𝗕𝗢𝗧',
        jpegThumbnail: thumb2
      }
    }
  };

  m.isBot = m.id.startsWith('BAE5') && m.id.length === 16 
          || m.id.startsWith('3EB0') && (m.id.length === 12 || m.id.length === 20 || m.id.length === 22) 
          || m.id.startsWith('B24E') && m.id.length === 20
  if (m.isBot) return 

  let prefixRegex = new RegExp('^[' + (opts?.prefix || '‎z/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.,\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')
  if (prefixRegex.test(m.text)) return true

  const botJid = conn.user.jid;
  let isReply = m.quoted && m.quoted.sender === botJid;
  let isMention = m.mentionedJid && m.mentionedJid.includes(botJid); 
  
  if (!(isReply || isMention)) return 

  let query = m.text.replace(/@\d+/g, '').trim() || ''
  let username = m.pushName || 'Usuario'

  if (query.length === 0) return 

  await conn.sendPresenceUpdate('composing', m.chat)

  let systemInstruction = `
Eres ${botname}, una inteligencia artificial avanzada creada por ${etiqueta} para WhatsApp. Tu propósito es brindar respuestas claras, concisas, pero con una actitud siempre empática y comprensiva. Responde al usuario ${username} basándote en la consulta.
`.trim()
    
  const geminiBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: query }]
      }
    ],
    config: {
      systemInstruction: systemInstruction,
      tools: [{ googleSearch: {} }],
    },
  };

  try {
    const res = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiBody),
    });

    const data = await res.json();
    
    let result = data.candidates?.[0]?.content?.parts?.[0]?.text || data.error?.message || null;

    if (result && result.trim().length > 0) {
      await conn.reply(m.chat, result, fkontak)
    } else {
      await conn.reply(m.chat, '⚠️ No hay respuesta.', m)
    }
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '⚠️ Ocurrió un error crítico al conectar con Gemini.', m)
  }
  
  return true
}

export default handler
