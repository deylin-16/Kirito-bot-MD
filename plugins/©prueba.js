import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
    // Obtenemos la configuración para el nombre y la imagen
    const config = global.getAssistantConfig(conn.user.jid)
    
    // Definimos la imagen (puedes usar la de config o la URL directa)
    let iconoUrl = 'https://i.ibb.co/g8PsK57/IMG-20251224-WA0617.jpg'
    let coverBuffer = await (await fetch(iconoUrl)).buffer()

    try {
        // Usamos la función sendModify adaptada a tu variable 'conn'
        await conn.sendModify(m.chat, "Haz clic para unirte 🚀", m, {
            title: config.assistantName || 'Assembly',
            body: '🚀 Testing Sub-Bot Design',
            url: "https://chat.whatsapp.com/Kj6tqzVJ6WJGPiC8wrL8gw",
            thumbnail: coverBuffer,
            largeThumb: true
        })
    } catch (e) {
        // Si falla es porque tu 'simple.js' no tiene la función 'sendModify'
        console.error("Error al usar sendModify:", e)
        m.reply("❌ Tu bot no tiene la función 'sendModify' instalada. Usa el diseño anterior (sendMessage con externalAdReply).")
    }
}

handler.command = ['prueba2']
export default handler
