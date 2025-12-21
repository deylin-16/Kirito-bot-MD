import fetch from 'node-fetch';
import {format} from 'util';
const handler = async (m, {text}) => {
    if (!/^https?:\/\//.test(text)) return m.reply(' Te faltó el *url* de la pagina.');
  const _url = new URL(text);
  const url = global.API(_url.origin, _url.pathname, Object.fromEntries(_url.searchParams.entries()), 'APIKEY');
  const res = await fetch(url);
  if (res.headers.get('content-length') > 100 * 1024 * 1024 * 1024) {
    
    throw `Content-Length: ${res.headers.get('content-length')}`;
  }
  if (!/text|json/.test(res.headers.get('content-type'))) return conn.sendFile(m.chat, url, 'file', text, m);
  let txt = await res.buffer();
  try {
    txt = format(JSON.parse(txt + ''));
  } catch (e) {
    txt = txt + '';
  } finally {
    m.reply(txt.slice(0, 655366666) + '');
  }
};

handler.command = ['get'];

export default handler;