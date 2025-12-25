import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    
    // 1. Tu URL de redirección (La que quieres que se abra)
    let urlPersonalizada = 'https://www.deylin.xyz/1' 
    let iconoUrl = 'https://i.ibb.co/g8PsK57/IMG-20251224-WA0617.jpg'
    
    // 2. Descarga de imagen para convertirla en objeto binario interno
    let response = await fetch(iconoUrl)
    let buffer = await response.buffer()

    await conn.sendMessage(m.chat, {
        text: urlPersonalizada, 
        contextInfo: {
            // FORZAMOS EL BOTÓN "VER CANAL" PERO CON TU URL
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363160031023229@newsletter', // JID de canal (mantenlo)
                serverMessageId: 1,
                newsletterName: 'CLIC AQUÍ PARA ACCEDER', // Nombre que aparecerá en el botón
            },
            externalAdReply: {
                title: `🚀 COMUNIDAD: ${config.assistantName}`,
                body: 'Acceso Directo Personalizado',
                mediaType: 1,
                previewType: "PHOTO",
                thumbnail: buffer,
                
                // AQUÍ ESTÁ EL TRUCO:
                // Sincronizamos el sourceUrl con el mediaUrl. 
                // Al no haber archivo físico, WhatsApp "salta" a la URL de redirección oficial.
                sourceUrl: urlPersonalizada,
                mediaUrl: urlPersonalizada, 
                
                renderLargerThumbnail: true,
                showAdAttribution: true, // Esto añade el icono de link que da más fuerza al clic
            }
        }
    }, { quoted: m })
}

handler.command = ['prueba_maestra']
export default handler
