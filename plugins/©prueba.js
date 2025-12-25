import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    
    let urlDestino = 'https://www.deylin.xyz/1' 
    let iconoUrl = 'https://i.ibb.co/g8PsK57/IMG-20251224-WA0617.jpg'
    
    let buffer = await (await fetch(iconoUrl)).buffer()

    await conn.sendMessage(m.chat, {
        text: '〔 𝖳𝖤𝖢𝖭𝖮-𝖡𝖮𝖳 𝖴𝖲𝖤𝖱 𝖨𝖭𝖳𝖤𝖱𝖥𝖠𝖢𝖤 〕', 
        contextInfo: {
            externalAdReply: {
                // TÍTULO PRINCIPAL
                title: ' 𝖲𝖸𝖲𝖳𝖤𝖬: 𝖮𝖭𝖫𝖨𝖭𝖤 𝖥𝖮𝖱𝖢𝖤',
                
                // AQUÍ MODIFICAS EL TEXTO QUE APARECE ABAJO
                body: '🌐 𝖤𝖷𝖳𝖤𝖱𝖭𝖠𝖫 𝖫𝖨𝖭𝖪: 𝖵𝖤𝖱 𝖶𝖤𝖡', 
                
                thumbnail: buffer,
                mediaType: 1,
                renderLargerThumbnail: true,
                showAdAttribution: true, 
                
                // REPLICAMOS LA URL PARA EVITAR EL "CAMPO VACÍO"
                sourceUrl: urlDestino,
                mediaUrl: urlDestino,
            }
        }
    }, { quoted: m })
}

handler.command = ['prueba_hacker']
export default handler
