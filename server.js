const express = require("express");
const cors = require("cors");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 админ
const ADMIN_LOGIN = "admin";
const ADMIN_PASSWORD = "admin2201";

// 📅 память (временно)
let slots = [];

// 🤖 Telegram
const bot = new TelegramBot(process.env.TOKEN);
const CHAT_ID = process.env.CHAT_ID;

// логин
app.post("/login", (req, res) => {
    const { login, password } = req.body;

    res.json({
        success: login === ADMIN_LOGIN && password === ADMIN_PASSWORD
    });
});

// добавить слот
app.post("/add-slot", (req, res) => {
    const { time } = req.body;

    const slot = {
        id: Date.now(),
        time,
        booked: false
    };

    slots.push(slot);
    res.json(slots);
});

// получить слоты
app.get("/slots", (req, res) => {
    res.json(slots);
});

// запись
app.post("/book", (req, res) => {
    const { id, name } = req.body;

    const slot = slots.find(s => s.id === id);

    if (!slot || slot.booked) {
        return res.json({ success: false });
    }

    slot.booked = true;

    bot.sendMessage(CHAT_ID,
        `Новая запись 💅\nИмя: ${name}\nВремя: ${slot.time}`
    );

    res.json({ success: true });
});

app.listen(3000, () => console.log("Server running"));
