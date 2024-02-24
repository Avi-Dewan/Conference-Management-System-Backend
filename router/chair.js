const express = require('express');
const db = require('../db/database');  // Assuming you have a Supabase-compatible database object

const router = express.Router();

router.post("/reject_paper", async (req, res) => {
    try {
  
  
        let {paper_id} = req.body;
      

      const { data, error } = await db
        .from('paper')
        .update({status: 'rejected'})
        .eq("paper_id" , paper_id);
  
  
      res.status(201).json("deleted successfully");
    } catch (error2) {
      console.error(error2);
      
      res.status(500).json({ error: 'Internal Server Error' });
    }
    
  });


  router.post("/accept_paper", async (req, res) => {
    try {
  
  
        let {paper_id} = req.body;
      

      const { data, error } = await db
        .from('paper')
        .update({status: 'accepted'})
        .eq("paper_id" , paper_id);
  
  
      res.status(201).json("deleted successfully");
    } catch (error2) {
      console.error(error2);
      
      res.status(500).json({ error: 'Internal Server Error' });
    }
    
  });


  router.post("/revise_paper", async (req, res) => {
    try {
  
  
      let paper_id = req.body.paper_id;

      let deadline = req.body.submission_deadline;
      

      const { data, error } = await db
        .from('paper')
        .update({status: 'revise'})
        .eq("paper_id" , paper_id);

      await db.from('revisePaperSubmission').insert([{paper_id, deadline}])

      
  
  
      res.status(201).json("edited successfully");
    } catch (error2) {
      console.error(error2);
      
      res.status(500).json({ error: 'Internal Server Error' });
    }
    
  });

module.exports = router;