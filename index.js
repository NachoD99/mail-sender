const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors({
  origin: ["http://localhost:5173", "https://trioptimo.com", "https://www.trioptimo.com"], // permití ambos
  methods: ["POST", "GET", "OPTIONS"],
}));

app.use(express.json());

const path = require("path");

// Ruta para manejar el formulario
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ error: "Email and message are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: email,
      to: [process.env.EMAIL_USER, "amydonald05@gmail.com"],
      subject: `New message from ${name}`,
      text: message,
      html: `
        <h3>Contact Form</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    res.status(200).json({ success: true, message: "Email sent" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

app.use(express.static(path.join(__dirname, "../client/dist")));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});