// trial.js
const express = require('express');
const db = require('../db/database'); 

const { v4: uuidv4 } = require('uuid');






const router = express.Router();



router.get("/:paper_id",async (req,res) => 
{
  try {
      const paper_id = req.params.paper_id;
      const { data, error } = await db
        .from('paper')
        .select('*')
        .eq('paper_id', paper_id);
  
      if (error) {
        throw error;
      }
  
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }

});
router.get("/:paper_id/author",async (req,res) => 
{
  try {
      const paper_id = req.params.paper_id;

      
      const { data, error } = await db
        .from('paperAuthor')
        .select(`user(first_name,last_name,current_institution)`)
        
        .eq('paper_id', paper_id);
  
      if (error) {
        throw error;
      }
      
      

      let returnData = []

      
      for(let i=0;i<data.length;i++)
      {
          returnData = [...returnData,{full_name: data[i].user.first_name + ' ' + data[i].user.last_name,current_institution : data[i].user.current_institution}]
      }

    

      
      res.status(200).json(returnData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }

});

router.get("/all", async (req, res) => {
    try {
      const { data, error } = await db
        .from('paper')
        .select('*');
  
      if (error) {
        throw error;
      }
  
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


router.post("/submit", async (req, res) => {
    try {
      
      const rifat = "c89a31f7-da91-42a8-8c6e-9cf5a47742a8";
      const avi =   "0aa34e07-985a-42ec-8299-48db5ab0581d";
      const rakib = "53012147-ccd7-4179-8166-76270223a9f2";
      const nafi =  "b51d5f7c-f023-4e07-aa94-45af7b9340c7";
      const piol =  "66df2a4d-0ad9-462d-9953-d2453c2b2175";

      var paper1,paper2 , paper3;

      paper1 = "7b3b5479-e7c9-4298-8432-07a95f34ef9b";
      paper2 = "2b8d62f2-fa14-4ce1-9d78-3f132fbe7d98";
      paper3 = "31ad3d24-a21e-4191-9cd9-c3e1bfef251e";


    //   const paper_id = paper2;

      let user_id = avi; // this is just to  test the db, actual author_id will come from req.body
      let {paper_id, paper_title, abstract, pdf_link, related_fields , file ,co_authors,main_author_id,conference_id} = req.body;
      
      paper_id = uuidv4();

      console.log(req.body)
      
      
      let author_id_arr = []
      for(let i=0;i<co_authors.length;i++)
      {
        author_id_arr = [...author_id_arr,co_authors[i].user_id]
      }
      // author_id_arr = [main_author_id, ... author_id_arr]


  
      const { data, error } = await db
        .from('paper')
        .insert([
          {
            paper_id,
            paper_title,
            abstract,
            pdf_link,
            related_fields,
            conference_id,
          },
        ]);

        
        
        for(let i=0;i<author_id_arr.length;i++)
        {
          user_id = author_id_arr[i];
          const {data2 , error2} = await db
          .from('author_request')
          .insert
          ([
              {
                  paper_id,
                  user_id
              }
          ]
          );
        
    
        if ( error2) {
          throw error;
        }
      }


      user_id = main_author_id;
      const {data3 , error3} = await db
      .from('paperAuthor')
      .insert
      ([
          {
              paper_id,
              user_id
          }
      ]
      );
    

      if ( error3) {
        throw error;
      }




      res.status(201).json("Paper created successfully");
    } catch (error2) {
      console.error(error2);
      
      res.status(500).json({ error: 'Internal Server Error' });
    }
    
  });



  router.get("/get_conference/:paper_id", async (req, res) => { //retrieves paper info based on paper id
    try {

      const paper_id = "7b3b5479-e7c9-4298-8432-07a95f34ef9b";

      const { data, error } = await db
        .from('paper')
        .select('*')
        .eq('paper_id', paper_id);
  
      if (error) {
        throw error;
      }
  
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });







module.exports = router;
