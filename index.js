const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:5000", "https://trioptimo.com", "https://www.trioptimo.com"], // permití ambos
  methods: ["POST", "GET", "OPTIONS"],
}));

app.use(express.json());

const path = require("path");

// Ruta para manejar el formulario
app.post("/api/contact", async (req, res) => {
  const { name, email, company, message } = req.body;

  console.log("📩 Data recibida en /api/contact:", req.body); 
  if (!email || !message) {
    return res.status(400).json({  error: "Email and message are required",
      bodyRecibido: req.body });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // ⛔️ Permitir certificados autofirmados
      },
    });

    await transporter.sendMail({
      from: email,
      to: [process.env.EMAIL_USER, "info@trioptimo.com"],
      subject: `New message from ${name}`,
      text: message,
      html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fafafa;">
    <h2 style="color: #e91e63; border-bottom: 2px solid #e91e63; padding-bottom: 10px;">📬 New Contact Form Submission</h2>
    <table style="width: 100%; margin-top: 20px;">
      <tr>
        <td style="padding: 8px 0; font-weight: bold; width: 100px;">Name:</td>
        <td style="padding: 8px 0;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Email:</td>
        <td style="padding: 8px 0;">${email}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Company:</td>
        <td style="padding: 8px 0;">${company}</td>
      </tr>
    </table>
    <div style="margin-top: 20px;">
      <p style="font-weight: bold; margin-bottom: 5px;">Message:</p>
      <div style="background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd; color: #333;">
        ${message}
      </div>
    </div>
    <p style="margin-top: 30px; font-size: 0.9em; color: #999;">You received this email from your website's contact form.</p>
  </div>
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