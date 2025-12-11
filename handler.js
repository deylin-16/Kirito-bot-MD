import { format } from 'util';
import { fileURLToPath } from 'url';
import path, { join } from 'path';
import { unwatchFile, watchFile } from 'fs';
import chalk from 'chalk';
import ws from 'ws';
import PhoneNumber from 'awesome-phonenumber';
import urlRegex from 'url-regex-safe';

// --- Funciones de soporte ---

// Serialización mínima de mensajes (smsg integrado)
function minimalSmsg(conn, m) {
    if (!m || !m.key || !m.key.remoteJid) return null;

    const botJid = conn.user?.jid || global.conn?.user?.jid || '';
    if (!botJid) {
        console.log(chalk.red('minimalSmsg FALLÓ: JID del bot no disponible.'));
        return null;
    }

    try {
        m.chat = conn.normalizeJid(m.key.remoteJid);
        m.sender = conn.normalizeJid(m.key.fromMe ? botJid : m.key.participant || m.key.remoteJid);
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        
        m.text = m.message?.extendedTextMessage?.text || m.message?.conversation || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || '';
        m.text = m.text ? m.text.replace(/[\u200e\u200f]/g, '').trim() : '';
        m.isCommand = (global.prefix instanceof RegExp ? global.prefix.test(m.text.trim()[0]) : m.text.startsWith(global.prefix || '!') ); // Usa '!' como fallback
        m.isMedia = !!(m.message?.imageMessage || m.message?.videoMessage || m.message?.audioMessage || m.message?.stickerMessage || m.message?.documentMessage);
        
        return m;
    } catch (e) {
        console.error(chalk.red("Error en serialización mínima (minimalSmsg)"), e);
        return null;
    }
}

// --- FUNCIÓN HANDLER PRINCIPAL ---

export async function handler(chatUpdate) {
    const conn = this;

    if (!chatUpdate || !chatUpdate.messages || chatUpdate.messages.length === 0) return;

    let m = chatUpdate.messages[chatUpdate.messages.length - 1];

    if (!m || !m.key || !m.message || !m.key.remoteJid) return;
    
    // 1. Verificar si el bot está listo (si no, no hacemos nada)
    if (!conn.user?.jid) return; 

    if (m.message) {
        m.message = (Object.keys(m.message)[0] === 'ephemeralMessage') ? m.message.ephemeralMessage.message : m.message;
    }

    // 2. SERIALIZACIÓN
    m = minimalSmsg(conn, m); 
    if (!m || !m.chat || !m.sender) {
        // console.log(chalk.red('Mensaje descartado después de serialización.'));
        return; 
    } 
    
    // 3. IMPRESIÓN DE MENSAJES EN CONSOLA (DEBE SER LO PRIMERO TRAS SERIALIZAR)
    try {
        const groupMetadata = m.isGroup ? (conn.chats[m.chat] || {}).metadata || await conn.groupMetadata(m.chat).catch(_ => null) || {} : {};
        const senderName = m.isGroup ? m.sender.split('@')[0] : await conn.getName(m.sender).catch(() => 'Usuario');
        const chatName = m.isGroup ? groupMetadata.subject : await conn.getName(m.chat).catch(() => 'Privado');

        const now = new Date();
        const formattedTime = now.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const chatLabel = m.isGroup ? `[G]` : `[P]`;
        let logText = m.text.replace(/\u200e+/g, '');
        logText = logText.replace(urlRegex({ strict: false }), (url) => chalk.blueBright(url));

        const logLine = chalk.bold.hex('#00FFFF')(`[${formattedTime}] `) +
                        chalk.hex('#7FFF00').bold(chatLabel) + ' ' +
                        chalk.hex('#FF4500')(`${chatName ? chatName.substring(0, 15) : 'N/A'}: `) +
                        chalk.hex('#FFFF00')(`${senderName}: `) +
                        (m.isCommand ? chalk.yellow(logText) : logText.substring(0, 60));

        console.log(logLine);
        if (m.isMedia) {
            console.log(chalk.cyanBright(`\t\t\t [Tipo: ${Object.keys(m.message)[0]}]`));
        }

    } catch (printError) {
        console.error(chalk.red('Error al imprimir mensaje en consola (secundario):'), printError);
    }
    
    // 4. CARGAR E INICIALIZAR LA BASE DE DATOS (REQUERIDO PARA LOS PLUGINS)
    if (global.db.data == null) {
        try {
            await global.loadDatabase();
        } catch (e) {
            console.error('Error al cargar la DB:', e);
            return;
        }
    }
    if (global.db.data == null) return;
    
    // Inicialización de datos de usuario/chat si no existen
    global.db.data.users[m.sender] ||= {};
    global.db.data.chats[m.chat] ||= { isBanned: false, modoadmin: false, antiLink: true, welcome: true };
    global.db.data.settings[conn.user.jid] ||= { self: false, restrict: true };

    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const settings = global.db.data.settings[conn.user.jid];
    
    // 5. LÓGICA DE EJECUCIÓN DE PLUGINS
    
    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins');
    
    let usedPrefix = '';
    let match = null;
    let command = '';
    let args = [];
    let text = m.text;

    for (const name in global.plugins) {
        const plugin = global.plugins[name];
        if (!plugin || plugin.disabled) continue;

        const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
        let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix;
        
        const prefixes = Array.isArray(_prefix) ? _prefix : [_prefix];
        
        for (const p of prefixes) {
            const re = p instanceof RegExp ? p : new RegExp(str2Regex(p));
            const execResult = re.exec(m.text);
            if (execResult) {
                match = [execResult, re];
                break;
            }
        }

        if (match) {
            usedPrefix = match[0][0];
            const noPrefix = m.text.replace(usedPrefix, '');
            [command, ...args] = noPrefix.trim().split(/\s+/).filter(v => v);
            text = args.join(' ');
            command = (command || '').toLowerCase();
        } else {
            continue;
        }

        const fail = plugin.fail || global.dfail;
        const isAccept = plugin.command instanceof RegExp ?
            plugin.command.test(command) :
            Array.isArray(plugin.command) ?
                plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                typeof plugin.command === 'string' ?
                    plugin.command === command : false;

        if (!isAccept) continue;
        
        m.plugin = name;

        // Si el chat está baneado y no es Owner, salimos.
        const isOwner = ['Aquí debes definir si es Owner'].includes(m.sender); // Esto debe estar definido en tu index.js o config.js
        if (chat?.isBanned && !isOwner) return;

        m.isCommand = true;
        
        const extra = { match, usedPrefix, noPrefix: text, args, command, text, conn, chat, user, settings };
        
        try {
            await plugin.call(conn, m, extra);
        } catch (e) {
            m.error = e;
            console.error(chalk.red(`Error en ejecución del plugin ${name}:`), e);
            // conn.reply(m.chat, `⚠️ Ocurrió un error al ejecutar el comando.`, m); // Puedes descomentar esto si quieres que el bot avise
        }
    }
}

global.dfail = (type, m, conn) => {
    const messages = {
        group: `Solo en grupos.`,
        admin: `Solo administradores.`,
        botAdmin: `Debo ser admin.`
    };
    if (messages[type]) {
        conn.reply(m.chat, messages[type], m);
    }
};

let file = global.__filename(import.meta.url, true);
watchFile(file, async () => {
    unwatchFile(file);
    console.log(chalk.magenta("Se actualizo 'handler.js'"));
    if (global.reloadHandler) console.log(await global.reloadHandler());
});
