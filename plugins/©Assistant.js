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

    // CONDICIÓN ESTRICTA: Solo activar si el JID del bot está en la lista de menciones.
    if (!mentionedJidSafe.includes(botJid)) {
        return true;
    }

    // --- El bot ha sido mencionado. Procedemos a limpiar la consulta. ---

    let query = text;

    // Eliminamos todas las menciones del texto para obtener solo la pregunta.
    for (let jid of mentionedJidSafe) {
        // Utilizamos una expresión regular para limpiar la mención y el posible espacio siguiente.
        query = query.replace(new RegExp(`@${jid.split('@')[0]}(\\s|$)`, 'g'), ' ').trim();
    }
    
    // Si aún queda un remanente de @, lo limpiamos
    query = query.trim();

    let username = m.pushName || 'Usuario';

    if (query.length === 0) return false;

    let jijiPrompt = `Eres Jiji, un gato negro sarcástico y leal, como el de Kiki: Entregas a Domicilio. Responde a ${username}: ${query}. 
    
    nota: si vas a resaltar un texto solo usas un * en cada esquina no **.`;

    try {
        conn.sendPresenceUpdate('composing', m.chat);

        const url = `${POLLINATIONS_BASE_URL}/${encodeURIComponent(jijiPrompt)}`;

        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }

        let result = await res.text();

        if (result && result.trim().length > 0) {
            
            // Corrección de formato: Negritas
            result = result.replace(/\*\*(.*?)\*\*/g, '*$1*').trim(); 
            
            // Corrección de formato: Párrafos
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
