
const express = require('express');
const db = require('../db/database'); 

const { v4: uuidv4 } = require('uuid');
const e = require('express');
const { resolveContent } = require('nodemailer/lib/shared');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();


const router = express.Router();

/*
/assign/auto/:conference_id
/assign/request
/assign/request_delete
/assign/sent_request/:conference_id
/assigned/:conference_id
/request/delete_request
/request/:user_id
/getConferenceInfo/:conference_id
/get_conference_chair/:conference_id
/reviewer/accept

*/

router.get("/assign/auto/:conference_id", async (req, res) => {
    try {
  
       const conference_id = req.params.conference_id;

      var already_assigned = [];

      var {data, error} = await db
        .from('requestKeynote')
        .select('user_id').eq('conference_id',conference_id);
  
  
        let already_requested = data.map(item =>item.user_id);
  
        var {data, error} = await db
        .from('assignedKeynote')
        .select('user_id').eq('conference_id',conference_id);
  
  
        let already_accepted = data.map(item =>item.user_id);  
  
        already_assigned = [...already_accepted , ...already_requested];
  
        const temp_unique = new Set(already_assigned);
  
        already_assigned = [...temp_unique];
  
      
  
  
  
      var { data, error } = await db //fetching data from paper table.
        .from('conference')
        .select('*')
        .eq('conference_id', conference_id); // needs to be equal to paper_id, that means infos corresponding to that specific id will come
  
      var related_fields = data.map(item => item.related_fields); // from that data, the fields that the paper has will be selected (cutting off the unneccessary data)
  
      related_fields = related_fields.flat(); // flattening the array to get rid of annoying [] 's
  
      // console.log("RELATED fields");
      // console.log(related_fields);
  
  
  
  
      var {data, error} = await db // similarly data will be fetched from paperAuthor table to get the author info
          .from('conferenceChair')
          .select('*')
          .eq('conference_id', conference_id);
  
      var authors = data.map(item => item.user_id); // making an array of only the author ids.
  
      authors = authors.flat(); // similar to previous one
  
      // console.log("author id");
      // console.log(authors);
  
  
      var {data, error} = await db // all user info are extracted
      .from('user')
      .select('*')
      
     
      var all_expertise = data.map(({user_id, expertise , current_institution}) => ({user_id, expertise, current_institution})); // from that data, only 3 fields are selected, user_id, expertise, institution
  
  
      //var related_institution = all_expertise.filter(item => authors.includes(item.user_id)).map(item => item.current_institution);

      
  
      var possible_user_id = all_expertise.filter(user => {
        console.log(user.expertise);
          return related_fields.some(keyword => user.expertise.includes(keyword));
      });
  
      console.log("possibe user id")
      console.log(possible_user_id)
  
      /*
      explanation:
      filter is used on all_expertise. Inside the filter, "user" is a placeholder for all_expertise values. 
      then user.expertise value is checked against the related fields values.
      Any value that is in related_fields will be inside the possible_user_id
      */
  
      // console.log("possible user id");
      // console.log(possible_user_id);
  
  
      //possible_user_id = possible_user_id.filter(user =>  !related_institution.includes(user.current_institution));
  
      /*
      more filtering is used to filter out the instittution that matches with the author
      */
      
      
  
      var actual_reviewer_id = possible_user_id.filter(user => !authors.includes(user.user_id));
      /*
      finally, the id's that matches with the author will be discarded
      */
  
  
      actual_reviewer_id = actual_reviewer_id.filter(user => !already_assigned.includes(user.user_id));
      /*
        filter out the already assigned reviewers
      */
  
      let dataT = []
  
        
      //console.log(actual_reviewer_id)
  
      let allAuthorName = []
  
    
      
      if(actual_reviewer_id.length === 0){
         // to check if there is any reviewer or not
  
         
          res.status(200).json(allAuthorName);
  
      }
      else{
          actual_reviewer_id = actual_reviewer_id.map(user => user.user_id); // extract only the reviewer id, and remove other data
  
          
  
          // console.log(actual_reviewer_id)
  
          
          for(let i = 0; i<actual_reviewer_id.length;i++)
          {
            let {data,err} = await db.from('user').select(`*`).eq('user_id',actual_reviewer_id[i]);
            
            let full_name = data[0].first_name + ' ' + data[0].last_name
            
            data[0].full_name = full_name
           
            
            allAuthorName = [...allAuthorName,data[0]]
  
            
          }
         
          res.status(200).json(allAuthorName);
      }
  
  
      if (error) {
        throw error;
      }
  
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  router.post("/assign/request", async (req, res) => {
    try {
  
      user_id = req.body.user_id
      conference_id = req.body.conference_id
      conference_title = req.body.conference_title
      
      
  
      let request_id = uuidv4();
  
      const { data, error } = await db
        .from('requestKeynote')
        .insert([
          {
            user_id : user_id,
            conference_id : conference_id,
            request_id : request_id
          },
        ]);
  
      if (error) {
        throw error;
      }
  
      // console.log("does it come here");
  
  
      res.status(201).json("Request sent");
  
  
      let notification_JSON = {
  
        type: "keynote_request",
        requested_user_id : user_id,
        requested_conference_id : conference_id,
        requested_conference_title : conference_title
      }
  
      let notification_id = uuidv4()
  
      let notification_body = `You are requested to be a keynote speaker in the conference titled ${conference_title}`;
  
      
        await db
        .from('notification')
        .insert([
          {
            notification_id : notification_id,
            notification_body : notification_body,
            notification_json : notification_JSON,
            user_id : user_id
          },
        ]);
  
        await db
        .from('requestNotification')
        .insert([
          {
            request_id : request_id,
            notification_id : notification_id,
          },
        ]);
  
        
  
      
  
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  router.post("/assign/requestNew", async (req, res) => {
    try {
  
      let coAuthor = req.body.coAuthor
      let conference_id = req.body.conference_id
      let conference_title = req.body.conference_title
      
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
  
      let request_id = uuidv4();
  
      const { data, error } = await db
        .from('requestKeynote')
        .insert([
          {
            user_id : user_id,
            conference_id : conference_id,
            request_id : request_id
          },
        ]);
  
      if (error) {
        throw error;
      }
  
      // console.log("does it come here");
  
  
      res.status(201).json("Request sent");
  
  
      let notification_JSON = {
  
        type: "keynote_request",
        requested_user_id : user_id,
        requested_conference_id : conference_id,
        requested_conference_title : conference_title
      }
  
      let notification_id = uuidv4()
  
      let notification_body = `You are requested to be a keynote speaker in the conference titled ${conference_title}`;
  
      
        await db
        .from('notification')
        .insert([
          {
            notification_id : notification_id,
            notification_body : notification_body,
            notification_json : notification_JSON,
            user_id : user_id
          },
        ]);
  
        await db
        .from('requestNotification')
        .insert([
          {
            request_id : request_id,
            notification_id : notification_id,
          },
        ]);
  
        
  
      
  
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  router.post("/assign/request_delete", async (req, res) => {
    try {
      
      const conference_id = req.body.conference_id;
  
      const user_id = req.body.user_id;
      
      // console.log(paper_id,user_id,"delete")
  
      const { data, error } = await db
        .from('requestKeynote')
        .delete()
        .match({"user_id":user_id , "conference_id":conference_id});
  
        // await db
        // .from('notification')
        // .delete()
        // .match({"user_id":user_id});
  
  
        res.status(201).json("deleted successfully");
  
      if (error) {
        throw error;
      }
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  router.get("/assign/sent_request/:conference_id", async (req, res) => {
    try {
  
       
      const conference_id = req.params.conference_id;
  
      // console.log(paper_id)
  
      
      //let paper_id = "31ad3d24-a21e-4191-9cd9-c3e1bfef251e";
      
      
      const { data, error } = await db
        .from('requestKeynote')
        .select('*')
        .eq("conference_id",conference_id);
  
  
        const UserIds = [...new Set(data.map(item => item.user_id))];
  
        let user_info = [];
        for(let i = 0; i<UserIds.length; i++){
    
            let uid = UserIds[i];
            const {data, error} = await db
            .from('user')
            .select('*')
            .eq('user_id' , uid);
  
            user_info.push(data);
    
            
        }
    
        user_info =  user_info.flat();
        // console.log(user_info);
  
        const output = user_info.map(user => {
          const full_name = `${user.first_name} ${user.last_name}`;
          return {
            ...user,
            full_name: full_name,
          }
        });
  
  
      if (error) {
        throw error;
      }
  
      // console.log("does it come here");
  
  
      res.status(201).json(output);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  router.get("/assigned/:conference_id", async (req, res) => {
    try {

        const conference_id = req.params.conference_id;
        const { data , error } = await db.from('assignedKeynote').select('user(*)').eq('conference_id',conference_id);

        if(error) 
        {
            
            res.json([]);
            return;
        }
        // Flatten the data structure and add the full_name property
        const flattenedData = data.map(entry => ({
            user_id: entry.user.user_id,
            full_name: `${entry.user.first_name} ${entry.user.last_name}`,
            email: entry.user.email,
            expertise: entry.user.expertise,
            user_type: `${entry.user.user_type}`,
            date_of_birth: entry.user.date_of_birth,
            personal_links: entry.user.personal_links,
            current_institution: entry.user.current_institution,
            // Add other properties from the user object if needed
        }));
        
        
        res.json(flattenedData)
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});



router.post("/request/delete_request", async (req, res) => {
    try {
  
  
        let {user_id, conference_id} = req.body;
      
  
        let request_id = (await db
        .from('requestKeynote').select('request_id')
        .match({"user_id":user_id , "conference_id":conference_id})).data;
        
        request_id = request_id[0].request_id
  
        console.log("request id print korchi")
        console.log(request_id)
  
        // let notification_id = (await db
        // .from('requestNotification').select('notification_id')
        // .eq("request_id",request_id)).data
  
        
        // console.log("notification id print korchi")
        // console.log(notification_id)
        // notification_id = notification_id[0].notification_id
        
  
        
  
        
    //   const paper_id = paper2;
  
    //   let user_id = avi; // this is just to  test the db, actual author_id will come from req.body
    //   let {paper_id, paper_title, abstract, pdf_link, related_fields , file ,co_authors,main_author_id,conference_id} = req.body;
      
  
      const { data, error } = await db
        .from('requestKeynote')
        .delete()
        .match({"user_id":user_id , "conference_id":conference_id});
  
  
  
        // await db
        // .from('notification')
        // .delete()
        // .eq('notification_id',notification_id)
  
      res.status(201).json("deleted successfully");
    } catch (error2) {
      console.error(error2);
      
      res.status(500).json({ error: 'Internal Server Error' });
    }
    
  });


  router.get("/get_conference_chair/:conference_id", async (req, res) => { 
    try {
  
      const conference_id = req.params.conference_id;
  
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



router.get("/getConferenceInfo/:conference_id",async (req,res) =>   
{
  try {
      const conference_id = req.params.conference_id;

      let result = {
        conference_id : null,
        conference_title : null
      };

    //   const { data, error } = await db
    //     .from('poster')
    //     .select('poster_title,conference_id')
    //     .eq('poster_id', poster_id);
  
    //   if (error) {
    //     throw error;
    //   }


      result.conference_id = conference_id
      

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

router.post("/reviewer/accept", async (req, res) => {
    try {
        const { user_id, conference_id } = req.body;

        // Insert data into paperReviewer table
        const result = await db.from('assignedKeynote').insert([{ user_id, conference_id }]);

        res.status(200).json({ message: 'Poster accepted successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get("/request/:user_id", async (req, res) => {
  try {

    const user_id = req.params.user_id;

    // console.log(user_id);



    var { data, error } = await db //fetching data from paper table.
      .from('requestKeynote')
      .select('*')
      .eq('user_id', user_id); 

    //   data = data.flat();

    const ConfIds = [...new Set(data.map(item => item.conference_id))];



    // console.log(PaperIds);

    let conf_info = [];
    for(let i = 0; i<ConfIds.length; i++){

        let cid = ConfIds[i];
        var {data, error} = await db
        .from('conference')
        .select('*')
        .eq('conference_id' , cid);


        conf_info.push(data);
    }

    conf_info =  conf_info.flat();
    console.log(conf_info);



    //   console.log(data);

    res.status(200).json(conf_info);

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
  

module.exports = router;
