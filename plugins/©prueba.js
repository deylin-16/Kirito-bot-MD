let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    
    // Configuración de variables
    let redes = 'https://www.deylin.xyz/1' // Tu canal de WhatsApp
    let icono = 'https://i.ibb.co/g8PsK57/IMG-20251224-WA0617.jpg'
    let textbot = `Asistente: ${config.assistantName}`
    
    // Datos ficticios o reales del canal para el header del reenvío
    // Si tienes el JID real del canal puedes ponerlo en newsletterJid
    let channelRD = {
        id: '120363160031023229@newsletter', 
        name: 'Canal Oficial'
    }

    await conn.sendMessage(m.chat, {
        text: redes, // Enlace en el texto para asegurar la redirección
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: channelRD.id,
                serverMessageId: 100,
                newsletterName: channelRD.name,
            },
            externalAdReply: {
                showAdAttribution: true,
                title: textbot,
                body: '🚀 ♡⃝𝑻𝒆𝒄𝒏𝒐-𝑩𝒐𝒕҉ᚐ',
                mediaUrl: null,
                description: null,
                previewType: "PHOTO",
                thumbnailUrl: icono,
                sourceUrl: redes,
                mediaType: 1,
                renderLargerThumbnail: false
            },
        },
    }, { quoted: m })
}

handler.command = ['prueba']

export default handler
