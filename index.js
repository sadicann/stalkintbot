const { Telegraf } = require('telegraf')
const { Router, Markup } = Telegraf
const TelegrafInlineMenu = require('telegraf-inline-menu')
const axios = require('axios').default;
const getUrls = require('get-urls');
var request = require('request');
var he = require('he');
const { parse } = require('node-html-parser');
const commandParts = require('telegraf-command-parts');

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'
}

const bot = new Telegraf("1178059287:AAGfxUCHuTMUbuznleptsNoZioOvXdKN5Gc")

bot.use(commandParts())

bot.startPolling()
bot.start((ctx) => ctx.replyWithMarkdown(`*.:STALKINT BOT:.*
🔥 Fotoğraf araştırması için bir fotoğraf gönderin.
`))
bot.command('twitter', ctx =>  { 
    if (ctx.state.command.args) { 
        ctx.reply(ctx.state.command.args) 
    } else {
        ctx.reply("Kullanıcı adını girin!")
    }
} )
bot.on('photo', async (ctx) => {
    reverseSearch(ctx) 
})
bot.hears('hi', async (ctx) => {
    reverseSearch(ctx)
})
bot.launch()

const reverseSearch = async ctx => {
    try {
        ctx.reply("Ters görsel araması başlatılıyor..")
    let link = await ctx.telegram.getFileLink(ctx.message.photo[0].file_id)
        request({ url: 'https://www.google.com.tr/searchbyimage?image_url=' + link, method: 'GET', headers: headers },  (error, response, body) => { 
            if (response.body.includes('Tüm boyutlar')) { 
                urlRegExp = new RegExp(/(<a href="\/search\?tbs=simg:(.*?)">(.*?)<a href="\/search\?tbs=simg:(.*?)">Tüm boyutlar<\/a>)/)
                let url = he.decode('https://www.google.com.tr/search?tbs=simg:' + response.body.match(urlRegExp)[4])
                request({ url: url, method: 'GET', headers: headers }, (error, response, body) => { 
                    let doc = parse(response.body)
                    var divs = doc.querySelectorAll("[rel='noopener']");
                    var buttonList = []
                    divs.forEach(el => {
                        buttonList.push(Markup.urlButton(el.childNodes[0].childNodes[0].rawText, el._attrs.href))
                    });

                    const buttonsKeyboard = Markup.inlineKeyboard(
                        buttonList
                    , { columns: 1 }).extra()
                    ctx.telegram.sendMessage(
                        ctx.from.id,
                        'Sonuçlar',
                        buttonsKeyboard)
                    //console.log(doc.querySelector("[rel='noopener']"))
                    //console.log(doc.querySelector("[rel='noopener']").)
                 }) 
             } else {
                ctx.reply("Görsel bulunamadı")
             }
        })
    } catch (err) {
        console.log(err)
    }
}
