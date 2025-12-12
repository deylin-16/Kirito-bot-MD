import fetch from 'node-fetch';
import { sticker } from '../lib/sticker.js';

const POLLINATIONS_BASE_URL = 'https://text.pollinations.ai';

export async function before(m, { conn }) {
    if (!conn.user) return true;
    
    let user = global.db.data.users[m.sender];
    let chat = global.db.data.chats[m.chat];
    
    let mentionedJidSafe = Array.isArray(m.mentionedJid) ? m.mentionedJid : [];
    
    let botJid = conn.user.jid;
    let botNumber = botJid.split('@')[0];
    let text = m.text || '';
    
    let isBotExplicitlyMentioned = mentionedJidSafe.includes(botJid) || text.trim().startsWith('@');

    if (!isBotExplicitlyMentioned) {
        return true;
    }
    
    let query = text.replace(new RegExp(`@${botNumber}`, 'g'), '').trim();
    
    if (query.startsWith('@')) {
        query = query.replace(/^@\S+\s?/, '').trim();
    }
    
    let username = m.pushName || 'Usuario';

    if (query.length === 0) return false;

    let jijiPrompt = `Eres Jiji, un gato negro sarcástico y leal, como el de Kiki: Entregas a Domicilio. Responde a ${username}: ${query}`;

    try {
        conn.sendPresenceUpdate('composing', m.chat);
        
        const url = `${POLLINATIONS_BASE_URL}/${encodeURIComponent(jijiPrompt)}`;

        const res = await fetch(url);
        
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }

        let result = await res.text();

        if (result && result.trim().length > 0) {
            
            // CORRECCIÓN DE FORMATO 1: Reemplazar doble asterisco por simple para Negrita
            result = result.replace(/\*\*(.*?)\*\*/g, '*$1*').trim(); 
            
            // CORRECCIÓN DE FORMATO 2: Forzar un doble salto de línea (párrafo) después de cada signo de puntuación final (. ? !)
            result = result.replace(/([.?!])\s*/g, '$1\n\n').trim();
            
            await conn.reply(m.chat, result, m);
            await conn.readMessages([m.key]);
        } else {
            await conn.reply(m.chat, `🐱 Hmph. La IA no tiene nada ingenioso que decir sobre *eso*.`, m);
        }
    } catch (e) {
        await conn.reply(m.chat, '⚠️ ¡Rayos! No puedo contactar con la nube de la IA. Parece que mis antenas felinas están fallando temporalmente.', m);
    }

    return false;
}
