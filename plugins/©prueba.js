let handler = async (m, { conn }) => {
    try {
        await conn.sendModify(m.chat, "332", m, {
            title: 'PRUEBA DE DISEÑO',
            body: 'Si ves esto, la función funciona',
            url: "https://www.deylin.xyz",
            thumbnail: await (await fetch("https://i.ibb.co/g8PsK57/IMG-20251224-WA0617.jpg")).buffer(),
            largeThumb: true
        });
    } catch (e) {
        m.reply("❌ Tu bot no tiene implementada la función 'sendModify' en lib/simple.js");
    }
}
handler.command = ['testdesign']
export default handler
