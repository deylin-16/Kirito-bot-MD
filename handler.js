import chalk from 'chalk';
import { unwatchFile, watchFile } from 'fs';
import path from 'path';

// --- FUNCIÓN HANDLER PRINCIPAL ---

export async function handler(chatUpdate) {
    // 1. Verificar si el listener está activo
    console.log(chalk.bold.yellowBright(`\n[EVENTO RECIBIDO] - Hora: ${new Date().toLocaleTimeString()}`));

    // 2. Comprobar si hay mensajes en la actualización
    if (!chatUpdate || !chatUpdate.messages || chatUpdate.messages.length === 0) {
        console.log(chalk.red('[ERROR] No se encontraron mensajes en el evento.'));
        return;
    }

    // 3. Intenta obtener el último mensaje y el JID
    let m = chatUpdate.messages[chatUpdate.messages.length - 1];

    if (!m || !m.key || !m.key.remoteJid) {
        console.log(chalk.red('[ERROR] Mensaje incompleto o sin JID.'));
        return;
    }
    
    const remoteJid = m.key.remoteJid;
    
    // 4. Imprime el JID del chat que envió el mensaje y el tipo de mensaje
    console.log(chalk.bold.greenBright(`\n✅ MENSAJE DETECTADO EN: ${remoteJid}`));
    console.log(chalk.cyan(`   - Tipo de evento: ${m.message ? Object.keys(m.message)[0] : 'Desconocido'}`));
    console.log(chalk.cyan(`   - Desde: ${m.key.fromMe ? 'Yo' : (m.key.participant || 'Desconocido')}`));

    // 5. DEBUGGING: Si es un mensaje de texto, intenta imprimir una porción
    let textMessage = m.message?.extendedTextMessage?.text || m.message?.conversation || 'NO ES TEXTO';
    console.log(chalk.white(`   - Texto (parcial): ${textMessage.substring(0, 50)}...`));
    
    // 6. Responde al mensaje para confirmar funcionalidad
    if (this.user?.jid) {
        try {
            await this.sendMessage(remoteJid, { text: '✅ ¡Detectado! La prueba de handler funciona.' });
            console.log(chalk.blue('   - Respuesta de prueba enviada.'));
        } catch(e) {
            console.log(chalk.red('   - Error al enviar respuesta de prueba.'));
        }
    }

    console.log(chalk.bold.yellow('----------------------------------------------------'));
}

// --- FUNCIÓN DFAIL Y WATCHFILE (MANTENIDOS) ---
global.dfail = (type, m, conn) => { /* ... lógica dfail ... */ };

let file = global.__filename(import.meta.url, true);
watchFile(file, async () => {
    unwatchFile(file);
    console.log(chalk.magenta("Se actualizo 'handler.js'"));
    if (global.reloadHandler) console.log(await global.reloadHandler());
});
