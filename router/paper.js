// trial.js
const express = require('express');
const db = require('../db/database'); 

const { v4: uuidv4 } = require('uuid');
const e = require('express');






const router = express.Router();


router.get("/getConferenceInfo/:paper_id",async (req,res) =>   //retrives conference id,title and paper_title
{
  try {
      const paper_id = req.params.paper_id;

      let result = {
        paper_title : null,
        conference_id : null,
        conference_title : null
      };

      const { data, error } = await db
        .from('paper')
        .select('paper_title,conference_id')
        .eq('paper_id', paper_id);
  
      if (error) {
        throw error;
      }

      result.paper_title = data[0].paper_title
      result.conference_id = data[0].conference_id
      

        let conf_title = (await db
        .from('conference')
        .select('conference_title')
        .eq('conference_id', result.conference_id)).data[0].conference_title;
      
      result.conference_title = conf_title
      
      res.status(200).json(result);
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }

});


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
        .select(`user(user_id,first_name,last_name,current_institution)`)
        
        .eq('paper_id', paper_id);
  
      if (error) {
        throw error;
      }
      
      

      let returnData = []

      
      for(let i=0;i<data.length;i++)
      {
          returnData = [...returnData,{user_id: data[i].user_id, full_name: data[i].user.first_name + ' ' + data[i].user.last_name,current_institution : data[i].user.current_institution}]
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


router.post("/delete_submission", async (req, res) => {

  let {paper_id} = req.body;

  console.log(paper_id,"for delete")

  const { data, error } = await db
      .from('paper')
      .delete()
      .match({"paper_id":paper_id});


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
            status:"pending"
            
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
                  user_id,
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

    let paper_id = req.params.paper_id;

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

router.get("/get_conference_chair/:paper_id", async (req, res) => { //retrieves paper info based on paper id
  try {

    const paper_id = req.params.paper_id;

    let { data, error } = await db
      .from('paper')
      .select('conference_id')
      .eq('paper_id', paper_id);

    if (error) {
      throw error;
    }

    let conference_id = data[0].conference_id

    
    let chair_id = (await db
      .from('conferenceChair')
      .select('user_id')
      .eq('conference_id', conference_id)).data;

    res.status(200).json(chair_id[0].user_id);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.get("/mysubmission/:conference_id/:user_id", async (req, res) => { //retrieves paper info based on paper id
  try {

    const user_id = req.params.user_id;
    const conference_id = req.params.conference_id;

    let { data, error } = (await db
      .from('paper')
      .select('paperAuthor(paper_id,user_id)')
      .eq('conference_id', conference_id));

    if (error) {
      throw error;
    }

    let paper_ids = []

    let author_ids = []

    for(let i=0;i<data.length;i++)
    {
        let temp = data[i].paperAuthor

      for(let j=0;j<temp.length;j++)
      {
          if(temp[j].user_id == user_id)
          {
          paper_ids.push(temp[j].paper_id)
          }
      }
    }

    let myPapers = []
    for(let i=0;i<paper_ids.length;i++)
    {


      let paper_details = (await db
      .from('paper')
      .select('*')
      .eq('paper_id', paper_ids[i])).data[0];

      let author_details = (await db
      .from('paperAuthor')
      .select(`user(user_id,first_name,last_name,current_institution)`)
      
      .eq('paper_id', paper_ids[i])).data;
      

      let author_json = {
        author_id : null,
        author_full_name : null
      }

      let authors = []
      
      for(let l=0;l<author_details.length;l++)
      {
        let author_id = author_details[l].user.user_id
        let author_full_name = author_details[l].user.first_name+' ' + author_details[l].user.last_name

        authors.push({author_id: author_id,full_name: author_full_name})

      }

      

      paper_details.authors = authors

      myPapers.push(paper_details)

        
    }


    

    // let conference_id = data[0].conference_id

    
    // let chair_id = (await db
    //   .from('conferenceChair')
    //   .select('user_id')
    //   .eq('conference_id', conference_id)).data;

    res.status(200).json(myPapers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

  // PaperAuthor(user_id,paper_id), Paper(paper_id,paper_title,abstract,related_fields,conference_id), Conference(conference_id,conference_title
  router.get("/allPapers/:user_id", async (req, res) => {
    try {
      // get all the papers of a user
      const user_id = req.params.user_id;
  
      const { data, error } = await db
        .from('paperAuthor')
        .select('paper_id')
        .eq('user_id', user_id);
  
      if (error) {  
        throw error;
      } else { 
  
        const papers = await Promise.all(data.map(async (data_instance) => {
          const { data: paper, error } = await db 
            .from('paper')
            .select('*')
            .eq('paper_id', data_instance.paper_id);
          
          if (error) {
            throw error;
          }
  
          return paper[0]; 
        }));
  
        res.status(200).json(papers);
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  });;








module.exports = router;
