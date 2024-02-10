const express = require('express');
const db = require('../db/database'); 

const { v4: uuidv4 } = require('uuid');

const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();


const router = express.Router();


router.get("/:user_id",async (req,res) => 
{
  try {
      const user_id = req.params.user_id;
      const { data, error } = await db
        .from('notification')
        .select('notification_id,notification_body,notification_json')
        .eq('user_id', user_id);
  
      if (error) {
        throw error;
      }
  
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }

});

router.get("/single/:notification_id/:user_id",async (req,res) => 
{
  try {
      const notification_id = req.params.notification_id;
      const user_id = req.params.user_id;
      const { data, error } = await db
        .from('notification')
        .select('notification_id,notification_body,notification_json')
        .match({"notification_id":notification_id , "user_id":user_id});
  
      if (error) {
        throw error;
      }
  
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }

});

router.post("/send",async (req,res) => 
{
  
  try {
      
    
      let {user_id,notification_body,notification_json} = req.body
      

      let notification_id = uuidv4();

      console.log("Sending notification");

      const { data, error } = await db
        .from('notification')
        .insert([

          {
            notification_id:notification_id,notification_body:notification_body,notification_json:notification_json,user_id:user_id
          }
      
        ])

      console.log("Sending email");
        
      const { data:user } = await db.from('user').select('*').eq('user_id', user_id).single();

      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: `${process.env.DB_GMAIL}`,
          pass: `${process.env.DB_GMAIL_PASSWORD}`,
        },
      });
  
  
      const mailOptions = {
        from: process.env.DB_GMAIL,
        to: user.email,
        subject: "You got a new notification from Conference Management System",
        html: `
        <h1>Notification: </h1>
        <p>${notification_body}</p>
        <br>
        Click <a href="http://localhost:5173/login/${notification_id} style="background-color: 
        blue; color: white; padding: 10px 20px; text-decoration: none;">here</a> to view the notification.
    `,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ error: "Email could not be sent" });
        } else {
          console.log("Email sent: " + info.response);
          return res.status(200).json({ message: "Email send successfully" });
        }
      });


      
  
      res.status(200).json({success: "success"});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }

});

module.exports = router