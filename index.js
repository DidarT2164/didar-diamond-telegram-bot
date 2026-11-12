
import { Telegraf, Markup } from "telegraf";

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is missing in Render Environment");
}

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = process.env.ADMIN_CHAT_ID;
const PAYMENT_NUMBER = "01337445694";

const products = [
  ["25 Diamonds", 25],
  ["50 Diamonds", 40],
  ["115 Diamonds", 77],
  ["240 Diamonds", 152],
  ["355 Diamonds", 230],
  ["480 Diamonds", 304],
  ["610 Diamonds", 385],
  ["850 Diamonds", 535],
  ["1090 Diamonds", 685],
  ["1240 Diamonds", 770],
  ["2530 Diamonds", 1520],
  ["5060 Diamonds", 3040],
  ["Weekly Lite", 45],
  ["Weekly Membership", 150],
  ["Monthly Membership", 760]
];

const users = new Map();
const orders = new Map();

const menu = Markup.keyboard([
  ["💎 Diamond Packages"],
  ["🎫 Membership Passes"],
  ["🛒 Buy Now", "📦 My Orders"],
  ["💳 Payment", "📞 Contact Admin"]
]).resize();

bot.start((ctx) => {
  users.delete(ctx.from.id);

  return ctx.reply(
    "💎 WELCOME TO DIDAR DIAMOND STORE!\n\nআপনার পছন্দের সার্ভিস নির্বাচন করুন।",
    menu
  );
});

bot.command("id", (ctx) => {
  return ctx.reply(`Your Telegram ID: ${ctx.from.id}`);
});

bot.hears("💎 Diamond Packages", (ctx) => {
  const list = products.slice(0, 12)
    .map(p => `💎 ${p[0]} — ৳${p[1]}`).join("\n");

  return ctx.reply("💎 DIAMOND PACKAGES\n\n" + list, menu);
});

bot.hears("🎫 Membership Passes", (ctx) => {
  const list = products.slice(12)
    .map(p => `🎫 ${p[0]} — ৳${p[1]}`).join("\n");

  return ctx.reply("🎫 MEMBERSHIP PASSES\n\n" + list, menu);
});

bot.hears("🛒 Buy Now", (ctx) => {
  const buttons = products.map((p, i) => [
    Markup.button.callback(`${p[0]} — ৳${p[1]}`, `product_${i}`)
  ]);

  return ctx.reply(
    "🛒 আপনার পছন্দের প্যাকেজ নির্বাচন করুন:",
    Markup.inlineKeyboard(buttons)
  );
});

bot.action(/^product_(\d+)$/, async (ctx) => {
  const p = products[Number(ctx.match[1])];

  if (!p) return ctx.answerCbQuery("Invalid package");

  users.set(ctx.from.id, {
    product: p[0],
    price: p[1],
    step: "uid"
  });

  await ctx.answerCbQuery();

  return ctx.reply(
    `আপনি নির্বাচন করেছেন: ${p[0]}\nমূল্য: ৳${p[1]}\n\nএখন Free Fire UID পাঠান।`
  );
});

// Payment selection
bot.action(/^pay_(bkash|nagad)$/, async (ctx) => {
  const state = users.get(ctx.from.id);

  if (!state || state.step !== "payment") {
    return ctx.answerCbQuery("Order session expired");
  }

  state.payment = ctx.match[1] === "bkash" ? "bKash" : "Nagad";
  state.step = "trx";

  await ctx.answerCbQuery();

  return ctx.reply(
    `💳 ${state.payment} Personal\n` +
    `Number: ${PAYMENT_NUMBER}\n\n` +
    `৳${state.price} টাকা পাঠিয়ে Transaction ID দিন।\n\n` +
    "⚠️ পেমেন্ট যাচাইয়ের আগে অর্ডার Approved হবে না।"
  );
});

// Approve order
bot.action(/^approve_(.+)$/, async (ctx) => {
  if (!ADMIN_ID || String(ctx.from.id) !== String(ADMIN_ID)) {
    return ctx.answerCbQuery("Not authorized");
  }

  const order = orders.get(ctx.match[1]);

  if (!order) return ctx.answerCbQuery("Order not found");

  order.status = "Approved";

  await ctx.answerCbQuery("Approved");
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

  await bot.telegram.sendMessage(
    order.user,
    `✅ আপনার অর্ডার ${order.id} Approved হয়েছে।`
  );

  return ctx.reply(`Order ${order.id} approved.`);
});

// Reject order
bot.action(/^reject_(.+)$/, async (ctx) => {
  if (!ADMIN_ID || String(ctx.from.id) !== String(ADMIN_ID)) {
    return ctx.answerCbQuery("Not authorized");
  }

  const order = orders.get(ctx.match[1]);

  if (!order) return ctx.answerCbQuery("Order not found");

  order.status = "Rejected";

  await ctx.answerCbQuery("Rejected");
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

  await bot.telegram.sendMessage(
    order.user,
    `❌ আপনার অর্ডার ${order.id} Rejected হয়েছে। Admin-এর সাথে যোগাযোগ করুন।`
  );

  return ctx.reply(`Order ${order.id} rejected.`);
});

// My Orders
bot.hears("📦 My Orders", (ctx) => {
  const mine = [...orders.values()]
    .filter(o => o.user === ctx.from.id);

  if (!mine.length) {
    return ctx.reply("📦 আপনার কোনো অর্ডার পাওয়া যায়নি।", menu);
  }

  const result = mine.map(o =>
    `🆔 Order: ${o.id}\n` +
    `📦 Package: ${o.product}\n` +
    `💰 Price: ৳${o.price}\n` +
    `🎮 UID: ${o.uid}\n` +
    `💳 Payment: ${o.payment}\n` +
    `📌 Status: ${o.status}`
  ).join("\n\n");

  return ctx.reply("📦 YOUR ORDERS\n\n" + result, menu);
});

// Payment information
bot.hears("💳 Payment", (ctx) => {
  return ctx.reply(
    "💳 PAYMENT METHODS\n\n" +
    "🟣 bKash Personal\n" +
    `Number: ${PAYMENT_NUMBER}\n\n` +
    "🟠 Nagad Personal\n" +
    `Number: ${PAYMENT_NUMBER}\n\n` +
    "⚠️ টাকা পাঠানোর আগে প্যাকেজের মূল্য নিশ্চিত করুন।",
    menu
  );
});

// Contact Admin
bot.hears("📞 Contact Admin", (ctx) => {
  return ctx.reply(
    "📞 CONTACT ADMIN\n\n" +
    "কোনো সমস্যা হলে Admin-এর সাথে যোগাযোগ করুন।\n\n" +
    "WhatsApp: https://wa.me/8801337445694",
    Markup.inlineKeyboard([
      [Markup.button.url("📲 Contact on WhatsApp", "https://wa.me/8801337445694")]
    ])
  );
});

// Text handler - keep this AFTER menu handlers
bot.on("text", async (ctx) => {
  const value = ctx.message.text.trim();
  const state = users.get(ctx.from.id);

  if (!state) return;

  if (state.step === "uid") {
    if (!/^\d{5,15}$/.test(value)) {
      return ctx.reply("সঠিক Free Fire UID দিন।");
    }

    state.uid = value;
    state.step = "payment";

    return ctx.reply(
      "পেমেন্ট মাধ্যম নির্বাচন করুন:",
      Markup.inlineKeyboard([
        [Markup.button.callback("bKash", "pay_bkash")],
        [Markup.button.callback("Nagad", "pay_nagad")]
      ])
    );
  }

  if (state.step === "trx") {
    if (value.length < 5) {
      return ctx.reply("সঠিক Transaction ID দিন।");
    }

    const id = "DDS" + Date.now().toString().slice(-8);

    const order = {
      id,
      user: ctx.from.id,
      name: ctx.from.first_name,
      product: state.product,
      price: state.price,
      uid: state.uid,
      payment: state.payment,
      trx: value,
      status: "Pending"
    };

    orders.set(id, order);
    users.delete(ctx.from.id);

    await ctx.reply(
      `✅ অর্ডার জমা হয়েছে!\n\n` +
      `Order ID: ${id}\n` +
      `Package: ${order.product}\n` +
      `UID: ${order.uid}\n` +
      `Payment: ${order.payment}\n` +
      `Status: Pending`,
      menu
    );

    if (ADMIN_ID) {
      await bot.telegram.sendMessage(
        ADMIN_ID,
        `🛒 NEW ORDER\n\n` +
        `Order: ${id}\n` +
        `Customer: ${order.name}\n` +
        `Telegram ID: ${order.user}\n` +
        `Package: ${order.product}\n` +
        `Price: ৳${order.price}\n` +
        `UID: ${order.uid}\n` +
        `Payment: ${order.payment}\n` +
        `TRX ID: ${order.trx}`,
        Markup.inlineKeyboard([
          [Markup.button.callback("✅ Approve", `approve_${id}`)],
          [Markup.button.callback("❌ Reject", `reject_${id}`)]
        ])
      );
    }

    return;
  }

  return ctx.reply("Menu থেকে আবার শুরু করুন।", menu);
});

bot.catch((err) => {
  console.error("Bot error:", err);
});

bot.launch();

console.log("💎 DIDAR DIAMOND STORE BOT STARTED!");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
