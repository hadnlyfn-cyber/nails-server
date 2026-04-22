const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 админ
const ADMIN_LOGIN = "admin";
const ADMIN_PASSWORD = "admin2201";

// 📦 MongoDB подключение
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// 📊 модель
const Slot = mongoose.model("Slot", {
    date: String,
    time: String,
    booked: Boolean,
    client: String
});

// 🤖 Telegram
const bot = new TelegramBot(process.env.TOKEN);
const CHAT_ID = process.env.CHAT_ID;

// 🔑 логин
app.post("/login", (req, res) => {
    const { login, password } = req.body;

    res.json({
        success: login === ADMIN_LOGIN && password === ADMIN_PASSWORD
    });
});

// ➕ добавить слот
app.post("/add-slot", async (req, res) => {
    const { date, time } = req.body;

    const slot = new Slot({
        date,
        time,
        booked: false,
        client: ""
    });

    await slot.save();
    res.json(await Slot.find());
});

// 📋 получить слоты
app.get("/slots", async (req, res) => {
    const slots = await Slot.find();
    res.json(slots);
});

// 📌 запись
app.post("/book", async (req, res) => {
    const { id, name } = req.body;

    const slot = await Slot.findById(id);

    if (!slot || slot.booked) {
        return res.json({ success: false });
    }

    slot.booked = true;
    slot.client = name;
    await slot.save();

    bot.sendMessage(
        CHAT_ID,
        `💅 Новая запись!\nИмя: ${name}\nДата: ${slot.date}\nВремя: ${slot.time}`
    );

    res.json({ success: true });
});

app.listen(3000, () => console.log("Server started"));
