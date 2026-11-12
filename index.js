import { Telegraf, Markup } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

const ADMIN = "8801337445694";

const products = [
  ["25 Diamonds", "৳25"],
  ["50 Diamonds", "৳40"],
  ["115 Diamonds", "৳80"],
  ["240 Diamonds", "৳160"],
  ["355 Diamonds", "৳240"],
  ["480 Diamonds", "৳320"],
  ["610 Diamonds", "৳400"],
  ["850 Diamonds", "৳550"],
  ["1240 Diamonds", "৳800"],
  ["2530 Diamonds", "৳1600"],
  ["Weekly Lite", "৳45"],
  ["Weekly Membership", "৳150"],
  ["Monthly Membership", "৳760"]
];

const menu = Markup.keyboard([
  ["💎 Diamond Packages"],
  ["🎫 Membership Passes"],
  ["🛒 Buy Diamonds", "📦 My Orders"],
  ["💳 Payment", "📞 Contact Admin"]
]).resize();

bot.start((ctx) => {
  ctx.reply(
    "💎 WELCOME TO DIDAR DIAMOND STORE!\n\n" +
    "🔥 Free Fire Diamond & Membership Shop\n\n" +
    "নিচের Menu থেকে আপনার পছন্দের অপশন নির্বাচন করুন।",
    menu
  );
});

bot.hears("💎 Diamond Packages", (ctx) => {
  const list = products.slice(0, 10)
    .map((p) => `💎 ${p[0]} — ${p[1]}`).join("\n");

  ctx.reply("💎 DIAMOND PACKAGES\n\n" + list);
});

bot.hears("🎫 Membership Passes", (ctx) => {
  const list = products.slice(10)
    .map((p) => `🎫 ${p[0]} — ${p[1]}`).join("\n");

  ctx.reply("🎫 MEMBERSHIP PASSES\n\n" + list);
});

bot.hears("🛒 Buy Diamonds", (ctx) => {
  ctx.reply("🆔 আপনার Free Fire UID পাঠান।");
});

bot.hears("📦 My Orders", (ctx) => {
  ctx.reply("📦 অর্ডারের তথ্য জানতে Admin-এর সাথে যোগাযোগ করুন।");
});

bot.hears("💳 Payment", (ctx) => {
  ctx.reply(
    "💳 PAYMENT METHODS\n\n" +
    "bKash Personal\n" +
    "Nagad Personal\n\n" +
    "পেমেন্টের আগে Admin-এর কাছ থেকে নম্বর নিশ্চিত করুন।"
  );
});

bot.hears("📞 Contact Admin", (ctx) => {
  ctx.reply("📞 WhatsApp: 01337445694");
});

bot.on("text", (ctx) => {
  const text = ctx.message.text;
  if (text.startsWith("/")) return;

  ctx.reply("আপনার মেসেজ পেয়েছি। Menu থেকে অপশন নির্বাচন করুন।", menu);
});

bot.catch((err) => console.error("Bot Error:", err));

bot.launch();
console.log("💎 DIDAR DIAMOND STORE BOT STARTED!");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
