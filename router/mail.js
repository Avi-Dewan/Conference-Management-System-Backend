// trial.js
const express = require('express');
const db = require('../db/database'); 
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

const router = express.Router();

dotenv.config();


router.post('/', async (req, res) => {

  const {email, message} = req.body;

    // Send the PIN to the user's email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: `${process.env.DB_GMAIL}`,
        pass: `${process.env.DB_GMAIL_PASSWORD}`,
      },
    });


    const mailOptions = {
      from: process.env.DB_GMAIL,
      to: email,
      subject: "Review Request",
      html: `
      <h1>Welcome to Conference Management System</h1>
      <p>${message}</p>
      <a href="https://www.ggogle.com" style="background-color: 
      blue; color: white; padding: 10px 20px; text-decoration: none;">Click Me</a>
  `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        // console.log(error);
        return res.status(500).json({ error: "Email could not be sent" });
      } else {
        // console.log("Email sent: " + info.response);
        return res.status(200).json({ message: "Email send successfully" });
      }
    });

});


module.exports = router;
