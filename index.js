process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import * as ws from 'ws';
import { readdirSync, statSync, existsSync, mkdirSync, watch } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import { assistant_accessJadiBot } from './plugins/©acceso.js';
import chalk from 'chalk';
import pino from 'pino';
import path, { join } from 'path';
import { Boom } from '@hapi/boom';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import store from './lib/store.js';
const { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, Browsers } = await import('@whiskeysockets/baileys');
import readline from 'readline';
import NodeCache from 'node-cache';
const { chain } = lodash;

protoType();
serialize();

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
};

const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.db = new Low(new JSONFile('database.json'));
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) return;
  global.db.READ = true;
  await global.db.read().catch(console.error);
  global.db.READ = null;
  global.db.data = { users: {}, chats: {}, stats: {}, msgs: {}, sticker: {}, settings: {}, ...(global.db.data || {}) };
  global.db.chain = chain(global.db.data);
};
loadDatabase();

const { state, saveCreds } = await useMultiFileAuthState(global.sessions);
const { version } = await fetchLatestBaileysVersion();

const connectionOptions = {
  logger: pino({ level: 'silent' }),
  browser: Browsers.macOS("Chrome"),
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
  },
  version: version,
};

global.conn = makeWASocket(connectionOptions);

async function loadSubBots() {
    const subBotsFolder = path.join(__dirname, global.jadi)
    if (!fs.existsSync(subBotsFolder)) return
    const subBots = readdirSync(subBotsFolder)
    for (const id of subBots) {
        const pathAssistantAccess = path.join(subBotsFolder, id)
        if (statSync(pathAssistantAccess).isDirectory() && existsSync(join(pathAssistantAccess, 'creds.json'))) {
            setTimeout(() => assistant_accessJadiBot({ pathAssistantAccess, phoneNumber: id, conn: global.conn }), 5000)
        }
    }
}

async function connectionUpdate(update) {
  const { connection, lastDisconnect } = update;
  if (connection === "open") {
    console.log(chalk.green(`\n:: CONEXIÓN ESTABLECIDA ::\n> Bot: ${conn.user.name}\n`));
    await loadSubBots();
  }
  if (connection === 'close') {
    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
    if (reason !== DisconnectReason.loggedOut) await global.reloadHandler(true);
  }
}

let handler = await import('./handler.js');
global.reloadHandler = async function(restatConn) {
  if (restatConn) {
    try { global.conn.ws.close(); } catch {}
    conn.ev.removeAllListeners();
    global.conn = makeWASocket(connectionOptions);
  }
  conn.handler = handler.handler.bind(global.conn);
  conn.connectionUpdate = connectionUpdate.bind(global.conn);
  conn.credsUpdate = saveCreds.bind(global.conn, true);
  conn.ev.on('messages.upsert', conn.handler);
  conn.ev.on('connection.update', conn.connectionUpdate);
  conn.ev.on('creds.update', conn.credsUpdate);
  return true;
};

const pluginFolder = join(__dirname, './plugins');
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};
async function readRecursive(folder) {
  for (const filename of readdirSync(folder)) {
    const file = join(folder, filename);
    if (statSync(file).isDirectory()) await readRecursive(file);
    else if (pluginFilter(filename)) {
      const module = await import(global.__filename(file));
      global.plugins[file.replace(pluginFolder + '/', '')] = module.default || module;
    }
  }
}
readRecursive(pluginFolder).catch(console.error);
await global.reloadHandler();
