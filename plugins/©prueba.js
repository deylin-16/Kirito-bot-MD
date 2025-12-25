let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    let redes = 'https://www.deylin.xyz/1'
    let icono = 'https://i.ibb.co/g8PsK57/IMG-20251224-WA0617.jpg'
    let textbot = `Asistente: ${config.assistantName}`

    await conn.sendMessage(m.chat, {
        image: { url: icono },
        caption: `\( {textbot}\n🚀 ♡⃝𝑻𝒆𝒄𝒏𝒐-𝑩𝒐𝒕҉ᚐ\n\n \){redes}`
    }, { quoted: m })
}

handler.command = ['prueba']
export default handler