import 'dotenv/config'
import TelegramBot from "node-telegram-bot-api";
import {download, isUrl} from "./src/kernel.js";

const TOKEN = process.env.BOT_TOKEN;

const bot = new TelegramBot(TOKEN, { polling: true });

bot.on('message',async (msg) => {
  try{
    if (!isUrl(msg.text))
      return bot.sendMessage(msg.chat.id, 'please send a valid url');

    const file = await download(msg.text);
    bot.sendAudio(msg.chat.id, `./${file}`);
  }catch (e){
    bot.sendMessage(msg.chat.id, '404 - not found');
  }
});
