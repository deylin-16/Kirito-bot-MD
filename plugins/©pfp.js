let handler = async (m, { conn, text }) => {
    if (!text) return
    
    
    let args = text.trim().split(/ +/)
    let extension = args[0].toLowerCase() 
    let validPhrases = /^(foto|perfil)$/i
    
    
    if (text.toLowerCase().startsWith('foto de perfil')) {
        extension = 'foto de perfil'
    }

    if (!/^(foto de perfil|perfil|foto)$/i.test(extension)) return

    let who
    if (m.quoted?.sender) {
        who = m.quoted.sender
    } else if (m.mentionedJid?.[0]) {
        who = m.mentionedJid[0]
    } else {
        
        let number = text.replace(/[^0-9]/g, '')
        if (number.length > 8) {
            who = number + '@s.whatsapp.net'
        }
    }

    if (!who) {
        return conn.sendMessage(m.chat, {
            text: 'Menciona a alguien, responde a un mensaje o escribe un número tras la frase.'
        }, {
            quoted: m
        })
    }

    let name = await (async () => {
        const dbName = global.db.data.users[who]?.name
        if (dbName) return dbName
        try {
            const contactName = await conn.getName(who)
            return (typeof contactName === 'string' && contactName.trim()) ? contactName : who.split('@')[0]
        } catch {
            return who.split('@')[0]
        }
    })()

    await m.react('🕒')

    let pp
    try {
        pp = await conn.profilePictureUrl(who, 'image')
    } catch {
        try {
            pp = await conn.profilePictureUrl(m.chat, 'image')
            await conn.sendMessage(m.chat, {
                text: `*La foto de ${name} es privada, te envío la del grupo.*`
            }, {
                quoted: m
            })
        } catch {
            pp = 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg'
            await conn.sendMessage(m.chat, {
                text: `*No encontré nada para ${name}.*`
            }, {
                quoted: m
            })
        }
    }

    await conn.sendFile(m.chat, pp, 'profile.jpg', `*Aquí tienes la foto de perfil de ${name}*`, m)
    await m.react('✔️')
}

handler.command = ['robar', 'tomar', 'obtener']

export default handler
