const express = require('express');
const db = require('../db/database');  // Assuming you have a Supabase-compatible database object

const router = express.Router();


router.get("/:user_id", async (req, res) => {
  try {

    const user_id = req.params.user_id;

    console.log(user_id);



    var { data, error } = await db //fetching data from paper table.
      .from('request')
      .select('*')
      .eq('user_id', user_id); 

      console.log(data);

      res.status(200).json(data);

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});







module.exports = router;
