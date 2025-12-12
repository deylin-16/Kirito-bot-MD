import fetch from 'node-fetch';
import { sticker } from '../lib/sticker.js';

export async function before(m, { conn }) {
    if (!conn.user) return true;

    let botJid = conn.user.jid;
    let text = m.text || '';
    
    // Esto asegura que la variable existe sin lanzar errores
    let mentionedJidSafe = Array.isArray(m.mentionedJid) ? m.mentionedJid : [];

    // LÓGICA DE RESPUESTA DE PRUEBA: Responde a CUALQUIER texto que no esté vacío.
    if (text.length > 0) {
        
        let isMentioned = mentionedJidSafe.includes(botJid) ? 'SÍ' : 'NO';
        
        // EJECUCIÓN DEL DIAGNÓSTICO
        try {
            conn.sendPresenceUpdate('composing', m.chat);
            
            let diagnosticMessage = `
⚙️ **DIAGNÓSTICO FINAL** ⚙️
---
1.  **Texto Recibido (m.text):** "${text}"
2.  **JID del Bot:** ${botJid}
3.  **¿Mencionado?** ${isMentioned}
4.  **Lista Completa de Mencionados (JIDs):**
    * ${mentionedJidSafe.join('\n* ') || 'Ninguno'}
---
✅ Ejecución Exitosa.
`.trim();

            await conn.reply(m.chat, diagnosticMessage, m);
            await conn.readMessages([m.key]);
        } catch (e) {
            // Si el diagnóstico falla, el problema es la conexión de la API o la respuesta
            await conn.reply(m.chat, '⚠️ Falló el diagnóstico, pero el código se ejecutó.', m);
        }

        return false;
    }
    
    return true;
}
