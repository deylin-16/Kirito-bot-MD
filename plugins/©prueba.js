const handler = async (m, { conn }) => {

let h = conn.user.jid

return m.reply(h)

handler.command = ['h']
export default handler;