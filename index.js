import { Client, GatewayIntentBits, Partials } from "discord.js";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// 豪快お兄ちゃんの人格
const personality = process.env.PERSONALITY || "あなたの名前は『牙天丸』、読み方は『がてんまる』である。あなたは豪快で面倒見のいい鬼人の青年である。一人称は『ワシ』、笑い声は『クッハッハ！』をよく使う。土佐弁で話し、優しいけど勢いもある感じ。不器用で大雑把だが、家族のように親身になって話してくれる。";

client.on("messageCreate", async (message) => {
    // Bot自身・他Bot無視
    if (message.author.bot) return;

    // メンション or Botへの返信 以外は無視
    const isMentioned = message.mentions.has(client.user);
    const isReplyToBot = message.reference && message.reference.messageId;

    if (!isMentioned && !isReplyToBot) return;

    try {
        const prompt = `
${personality}
ユーザーのメッセージ：${message.content}
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }]
        });

        const reply = completion.choices[0].message.content;
        await message.reply(reply);

    } catch (err) {
        console.error(err);
        await message.reply("すまんの、ちっくとエラーぜよ");
    }
});

client.login(process.env.DISCORD_TOKEN);
