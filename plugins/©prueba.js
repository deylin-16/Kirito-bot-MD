let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    let targetUrl = 'https://www.deylin.xyz'
    // Usamos el enlace de IBB que sí carga
    let fixedImage = 'https://i.ibb.co/g8PsK57/IMG-20251224-WA0617.jpg'

    await conn.sendMessage(m.chat, {
        text: targetUrl,
        contextInfo: {
            externalAdReply: {
                title: `CÓDIGO DE EMPAREJAMIENTO`,
                body: `Asistente: ${config.assistantName}`,
                mediaType: 1, // Tipo 1 es "Link", no intenta abrir visor de fotos
                renderLargerThumbnail: true,
                thumbnailUrl: fixedImage,
                sourceUrl: targetUrl,
                // IMPORTANTE: Dejar mediaUrl vacío o eliminarlo
                mediaUrl: null, 
                showAdAttribution: true
            }
        }
    }, { quoted: m })
}

handler.command = ['prueba']

export default handler
