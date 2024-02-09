const express = require('express');
const db = require('../db/database'); 

const { v4: uuidv4 } = require('uuid');

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


router.post("/send",async (req,res) => 
{
  
  try {
      
    
      let {user_id,notification_body,notification_json} = req.body
      

      let notification_id = uuidv4();

      const { data, error } = await db
        .from('notification')
        .insert([

          {
            notification_id:notification_id,notification_body:notification_body,notification_json:notification_json,user_id:user_id
          }
      
        ])

  
      res.status(200).json({success: "success"});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }

});

module.exports = router