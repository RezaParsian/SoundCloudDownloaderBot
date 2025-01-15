import 'dotenv/config'
import fs from "fs";
import TelegramBot from "node-telegram-bot-api";
import {download, isUrl} from "./src/kernel.js";

const TOKEN = process.env.BOT_TOKEN;
const ADMIN = process.env.BOT_ADMIN;

const bot = new TelegramBot(TOKEN, { polling: true });

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
        error: e.message,
      }));
    }
  });
});
