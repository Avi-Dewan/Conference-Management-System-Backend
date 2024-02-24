// trial.js
const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const db = require('../db/database'); 

const { v4: uuidv4 } = require('uuid');






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

  // console.log(paper_id,"for delete")

  const { data, error } = await db
      .from('paper')
      .delete()
      .match({"paper_id":paper_id});


});



router.post("/submit", async (req, res) => {
    try {
      


      //   const paper_id = paper2;

      let user_id = req.body.main_author_id; // this is just to  test the db, actual author_id will come from req.body
      let {paper_title, abstract, pdf_link, related_fields ,co_authors , co_authors_without_account, main_author_id, conference_id} = req.body;
        
        // main_author_id -> bring main author info from user table in main_author_info

      const {data:main_author_info } = await db.from('user').select('*').eq('user_id', main_author_id).single();
        
  
      let paper_id = uuidv4();

      let co_authors_wihtout_account_id = [];
      

      for (let coAuthor of co_authors_without_account) {
        const user_id = uuidv4();
        const password = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(password, 10);
  
        const { error: userError } = await db
          .from('user')
          .insert([
            {
              user_id,
              first_name: coAuthor.first_name,
              last_name: coAuthor.last_name,
              email: coAuthor.email,
              current_institution: coAuthor.affiliation,
              expertise: [],
              personal_links: [],
            },
          ]);
  
        if (userError) {
          throw userError;
        }
        
        // console.log(`User created with email: ${coAuthor.email}`);
  
        const { error: authError } = await db
          .from('auth')
          .insert([
            {
              user_id,
              email: coAuthor.email,
              hashed_password: hashedPassword
            }
          ]);
        
        // console.log(authError);
        
        if (authError) {
          throw authError;
        }
        
        // console.log(`auth created with password: ${password}`);
  
        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: `${process.env.DB_GMAIL}`,
            pass: `${process.env.DB_GMAIL_PASSWORD}`,
          },
        });
    
    
        const mailOptions = {
          from: process.env.DB_GMAIL,
          to: coAuthor.email,
          subject: "Account created for Conference Management System",
          html: `
          <h1>Welcome to Conference Management System</h1>
          <p> User ${main_author_info.first_name} ${main_author_info.last_name} has made you o-author for paper: ${paper_title} </p>
          <br>
          <p> An account has been created for you on Conference Management System </p>

          <p> Your email is: ${coAuthor.email} </p>
          <p> Your password is: ${password} </p>

          <p> You can change your password and edit user info by loggin in:  
         <a href="http://localhost:5173/login/normal style="background-color: 
          blue; color: white; padding: 10px 20px; text-decoration: none;">Click Me</a>

          </p>
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
  
        co_authors.push({ user_id });
        co_authors_wihtout_account_id.push(user_id);
      }

      // console.log(co_authors);

      
      
      
      let author_id_arr = []

      for(let i=0;i<co_authors.length;i++)
      {
        author_id_arr = [...author_id_arr,co_authors[i].user_id]
      }
      // author_id_arr = [main_author_id, ... author_id_arr]

      // console.log(author_id_arr);
  
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

      // console.log("paper inserted");
        
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
          throw error2;
        }
      }

      // console.log("author request inserted");


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
        throw error3;
      }


      // console.log("paper author inserted");

      res.status(201).json({paper_id: paper_id, co_authors_wihtout_account_id: co_authors_wihtout_account_id});
    } catch (err) {

      console.error("error: ", err);
      
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

        let review_details = (await db
        .from ('assignedReviewer')
        .select('*')
        .eq('paper_id', paper_ids[i])).data;

        // console.log("reviwer details")
        // console.log(review_details)

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

        let reviews = []

        // console.log("review loop printing")
        for(let l = 0; l<review_details.length ; l++)
        {
          let rating = review_details[l].rating;
          let review = review_details[l].review;
          reviews.push({rating: rating , review:review})
          
          // console.log(rating);
          // console.log(review);
        }

      

        paper_details.authors = authors

        paper_details["reviews"] = reviews

        // console.log("paper details printing")
        // console.log(paper_details)

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


router.get("/all_authors/:paper_id", async (req, res) => {
    try {
      // get all the papers of a user
      const paper_id = req.params.paper_id;
  
      const { data, error } = await db
        .from('paperAuthor')
        .select('user_id')
        .eq('paper_id', paper_id);
  
      if (error) {  
        throw error;
      } else { 
        res.status(200).json(data);
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  });;





module.exports = router;
