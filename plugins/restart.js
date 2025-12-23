let handler = async (m, { conn, isROwner }) => {
    if (!isROwner) return 

    try {
        await m.reply(` *Reiniciando servidor...*\nEspere un momento por favor.`)
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        if (conn.ws.isOpen) conn.logout() 
        
        process.exit(0) 
    } catch (error) {
        console.error(error)
        conn.reply(m.chat, `❌ Error al intentar reiniciar: ${error.message}`, m)
    }
}

handler.command = ['restart', 'reiniciar']
handler.rowner = true

export default handler
