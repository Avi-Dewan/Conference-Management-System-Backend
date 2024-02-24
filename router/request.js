const express = require('express');
const db = require('../db/database');  // Assuming you have a Supabase-compatible database object

const router = express.Router();


router.get("/:user_id", async (req, res) => {
  try {

    const user_id = req.params.user_id;

    // console.log(user_id);



    var { data, error } = await db //fetching data from paper table.
      .from('request')
      .select('*')
      .eq('user_id', user_id); 

    //   data = data.flat();

    const PaperIds = [...new Set(data.map(item => item.paper_id))];



    // console.log(PaperIds);

    let paper_info = [];
    for(let i = 0; i<PaperIds.length; i++){

        let pid = PaperIds[i];
        var {data, error} = await db
        .from('paper')
        .select('*')
        .eq('paper_id' , pid);


        paper_info.push(data);
    }

    paper_info =  paper_info.flat();
    console.log(paper_info);



    //   console.log(data);

    res.status(200).json(paper_info);

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post("/delete_request", async (req, res) => {
    try {


        let {user_id, paper_id} = req.body;
      

        let request_id = (await db
        .from('request').select('request_id')
        .match({"user_id":user_id , "paper_id":paper_id})).data;
        
        request_id = request_id[0].request_id

        let notification_id = (await db
        .from('requestNotification').select('notification_id')
        .eq("request_id",request_id)).data

        notification_id = notification_id[0].notification_id
        

        

        
    //   const paper_id = paper2;

    //   let user_id = avi; // this is just to  test the db, actual author_id will come from req.body
    //   let {paper_id, paper_title, abstract, pdf_link, related_fields , file ,co_authors,main_author_id,conference_id} = req.body;
      
  
      const { data, error } = await db
        .from('request')
        .delete()
        .match({"user_id":user_id , "paper_id":paper_id});

        await db
        .from('notification')
        .delete()
        .eq('notification_id',notification_id)

      res.status(201).json("deleted successfully");
    } catch (error2) {
      console.error(error2);
      
      
      res.status(500).json({ error: 'Internal Server Error' });
    }
    
  });


router.get("/paper/:paper_id", async (req, res) => {
  try {

    const user_id = req.params.user_id;
    const paper_id = req.params.paper_id;

    let PaperIds = [];


    PaperIds.push(paper_id);

    let paper_info = [];
    for(let i = 0; i<PaperIds.length; i++){

        let pid = PaperIds[i];
        var {data, error} = await db
        .from('paper')
        .select('*')
        .eq('paper_id' , pid);


        paper_info.push(data);
    }

    paper_info =  paper_info.flat();
    
    // console.log(paper_info);



    //   console.log(data);

    res.status(200).json(paper_info);

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




module.exports = router;
