let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    
    let isBuffer = Buffer.isBuffer(config.assistantImage)
    let targetUrl = 'https://www.deylin.xyz'

    await conn.sendMessage(m.chat, {
        text: targetUrl,
        contextInfo: {
            externalAdReply: {
                title: `MIENTO`,
                body: `Asistente: ${config.assistantName}`,
                mediaType: 1,
                // Eliminamos previewType y mediaUrl para evitar conflictos
                renderLargerThumbnail: true,
                thumbnail: isBuffer ? config.assistantImage : null,
                thumbnailUrl: !isBuffer ? config.assistantImage : null,
                sourceUrl: targetUrl,
                // Forzamos a que no se trate como un archivo de video/audio
                showAdAttribution: true 
            }
        }
    }, { quoted: m })
}

handler.command = ['prueba']

export default handler
