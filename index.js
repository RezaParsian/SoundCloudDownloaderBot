import 'dotenv/config'
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
      bot.sendAudio(chatId, `./${file}`);
    } catch (e) {
      bot.sendMessage(chatId, 'خطایی رخ داد، لطفا بعدا تلاش کنید.');

      bot.sendMessage(ADMIN, JSON.stringify({
        message,
        chatId,
        error: e.message,
      }));
    }
  });
});
