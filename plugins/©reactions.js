import axios from 'axios'
import fs from 'fs'
import { join } from 'path'

let handler = async (m, { conn, command }) => {
    const path = join(process.cwd(), 'db', 'social_reactions.json')
    if (!fs.existsSync(path)) return

    let dbReacciones = JSON.parse(fs.readFileSync(path, 'utf-8'))
    let cmd = command.toLowerCase()
    
    const translate = { 
        'kiss': 'beso', 'hug': 'abrazo', 'slap': 'golpe', 'kill': 'matar',
        'pat': 'acariciar', 'dance': 'bailar' 
    }
    let key = translate[cmd] || cmd
    let data = dbReacciones[key]
    if (!data) return

    let user = m.sender
    let target = m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null)
    let textoFinal = ''
    let menciones = [user]

    if (target) {
        if (target === user) {
            textoFinal = data.txt_solo.replace('@user', `@${user.split('@')[0]}`)
        } else {
            textoFinal = data.txt_mencion.replace('@user', `@${user.split('@')[0]}`).replace('@target', `@${target.split('@')[0]}`)
            menciones.push(target)
        }
    } else {
        textoFinal = data.txt_grupo.replace('@user', `@${user.split('@')[0]}`)
    }

    try {
        const { data: tenorRes } = await axios.get(
            `https://api.tenor.com/v1/search?q=${encodeURIComponent(data.search)}&key=LIVDSRZULELA&limit=10`
        )

        if (!tenorRes?.results?.length) throw new Error()
        
        
        const randomGif = tenorRes.results[Math.floor(Math.random() * tenorRes.results.length)]
        const videoUrl = randomGif.media[0].mp4.url

        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: textoFinal,
            gifPlayback: true,
            mentions: menciones
        }, { quoted: m })

    } catch (e) {
        m.reply('❌ Error al conectar con Tenor.')
    }
}

handler.command = /^(beso|kiss|abrazo|hug|golpe|slap|matar|kill|pat|acariciar|bailar|dance)$/i
handler.group = true

export default handler
