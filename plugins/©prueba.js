let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    
    // El enlace de tu canal
    let channelUrl = 'https://whatsapp.com/channel/TU_ID_DEL_CANAL' 
    let fixedImage = 'https://i.ibb.co/g8PsK57/IMG-20251224-WA0617.jpg'

    await conn.sendMessage(m.chat, {
        text: channelUrl, // Poner el link también en el cuerpo del texto ayuda a la redirección
        contextInfo: {
            externalAdReply: {
                title: `Canal de ${config.assistantName}`,
                body: 'Haz clic aquí para unirte',
                mediaType: 1, 
                previewType: 0, // Forzar tipo de previsualización estándar
                renderLargerThumbnail: true,
                sourceUrl: channelUrl,
                thumbnailUrl: fixedImage,
                // Eliminamos mediaUrl para evitar que intente "reproducir" la imagen
            }
        }
    }, { quoted: m })
}

handler.command = ['prueba']

export default handler
