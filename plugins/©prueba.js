let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    
    // Configuración de variables
    let redes = 'https://www.deylin.xyz/1' 
    let icono = 'https://i.ibb.co/g8PsK57/IMG-20251224-WA0617.jpg'
    let textbot = `Asistente: ${config.assistantName}`

    await conn.sendMessage(m.chat, {
        text: redes, 
        contextInfo: { 
            isForwarded: true, 
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
            } 
        }
    }, { quoted: m })
}

handler.command = ['prueba']

export default handler
