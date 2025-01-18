import 'dotenv/config'
import fs from "fs";
import TelegramBot from "node-telegram-bot-api";
import {serve} from '@hono/node-server'
import {Hono} from 'hono'
import {download, isUrl} from "./src/kernel.js";

const TOKEN = process.env.BOT_TOKEN;
const ADMIN = process.env.BOT_ADMIN;
const PORT = process.env.PORT || 3000;

const app = new Hono()
const bot = new TelegramBot(TOKEN, {polling: false});


app.all('/', async (c) => {
  const json = await c.req.json();

  bot.processUpdate(json);

  return c.body('', 200);
});

async function isUserRegister(chatId) {
  return await bot.getChatMember('@Rp1376', chatId).then(data => {
    console.log(data)
    return data.status === 'member';
  });
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  bot.sendChatAction(chatId, 'typing')
      .then(async () => {
        await bot.sendMessage(chatId, 'سلام خوش امدی');

        if (!await isUserRegister(chatId))
          bot.sendMessage(chatId, 'خب قبل از هرکاری باید عضو این کانال بشی @Rp1376', {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "عضو شدم",
                    callback_data: "re-check",
                  },
                ],
              ],
            },
          })

      });
});


bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const action = callbackQuery.data;
  console.log(callbackQuery)
  let text = undefined;

  switch (action) {
    case 're-check':
      if (!await isUserRegister(chatId))
        text = 'هنوز عضو نشدی که شیطون 😁';
      else {
        text = 'ایول بابا <3'
        await bot.deleteMessage(chatId, msg.message_id);
        await bot.sendMessage(chatId, 'خب لینک آهنگ رو برام بفرست تا سریع برات دانلودش کنم');
      }
      break;
    default:
      await bot.sendMessage(chatId, 'نفهمیدم چی شد 😒')
  }

  if (text)
    await bot.answerCallbackQuery(callbackQuery.id, text);
})

bot.on('message',async (msg) => {
  const message = msg.text;
  const chatId = msg.chat.id;

  if (!isUrl(message))
    return bot.sendMessage(chatId, 'لطفا یک لینک معتبر ارسال کنید.');

  bot.sendChatAction(chatId, 'upload_audio').then(async () => {
    try {
      const file = await download(message);

      if (!file)
        return bot.sendMessage(chatId, 'خطایی رخ داد، لطفا بعدا تلاش کنید.');

      await new Promise(resolve => setTimeout(resolve, 1000));

      const stream = fs.createReadStream(file);

      bot.sendAudio(chatId, stream, {
        caption: 'از آهنگ لذت ببر ❤️',
      }).finally(() => {
        setTimeout(() => {
          fs.unlinkSync('./' + file);
        }, 1000);
      });
    } catch (e) {
      await bot.sendMessage(chatId, 'خطایی رخ داد، لطفا بعدا تلاش کنید.');

      await bot.sendMessage(ADMIN, JSON.stringify({
        message,
        chatId,
        error: e.message(),
      }));
    }
  });
});

serve({
  fetch: app.fetch,
  port: PORT
});