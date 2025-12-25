import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    
    let redes = 'https://www.deylin.xyz/1' 
    let iconoUrl = 'https://i.ibb.co/g8PsK57/IMG-20251224-WA0617.jpg'
    let botname = config.assistantName
    
    // Obtenemos el buffer de la imagen una sola vez
    let response = await fetch(iconoUrl)
    let imageBuffer = await response.buffer()

    // --- PRUEBA 1: Enlace Puro (Sin MediaType) ---
    // Esta opción quita la etiqueta de "Foto" para que el sistema lo vea solo como un link
    await conn.sendMessage(m.chat, {
        text: 'Prueba 1: Redirección Forzada (Sin MediaType)',
        contextInfo: {
            externalAdReply: {
                title: botname,
                body: '🚀 Toca aquí para entrar',
                thumbnail: imageBuffer,
                sourceUrl: redes,
                mediaType: 0, // 0 indica que no es multimedia, evita el visor de fotos
                renderLargerThumbnail: true,
                showAdAttribution: true
            }
        }
    }, { quoted: m })

    // --- PRUEBA 2: Formato Miniatura Estándar ---
    // A veces el error de "aplicación no compatible" lo da el modo de imagen grande
    await conn.sendMessage(m.chat, {
        text: 'Prueba 2: Formato Miniatura Estándar',
        contextInfo: {
            externalAdReply: {
                title: 'CLICK AQUÍ PARA EL CANAL',
                body: botname,
                thumbnail: imageBuffer,
                sourceUrl: redes,
                mediaType: 1,
                renderLargerThumbnail: false, // Imagen pequeña para evitar errores de renderizado
                showAdAttribution: false
            }
        }
    }, { quoted: m })
}

handler.command = ['prueba']

export default handler
