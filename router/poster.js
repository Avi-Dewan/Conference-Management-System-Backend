// trial.js
const express = require('express');
const db = require('../db/database'); 

const { v4: uuidv4 } = require('uuid');
const e = require('express');






const router = express.Router();


/*
"/author/reject_request"
"/author/accept_request"
"/author/get_request/:user_id"
"/author/get_request/:user_id/:poster_id"
"/submit"
"/:poster_id"
"/:poster_id/author"
"/assign/auto/:poster_id"
"/assign/request"
"/assign/request_delete"
"/assign/sent_request/:poster_id"
"/assign/manual/:poster_id"
"/reviewer/assigned/:poster_id"
"/getConferenceInfo/:poster_id"
"/all_authors/:poster_id"
"/request/:user_id"
"/request/delete_request"
"/get_conference_chair/:poster_id"
"/get_conference/:poster_id"
"/reviewer/accept"
"/reviewer/review"
"/reviewer/assignedPosters/:user_id"



*/

router.post("/author/reject_request", async (req, res) => {
    try {
  
  
        let {user_id, poster_id} = req.body;
      
  
      const { data, error } = await db
        .from('author_poster_request')
        .delete()
        .match({"user_id":user_id , "poster_id":poster_id});
  
        
        
  
  
      res.status(201).json("deleted successfully");
    } catch (error2) {
      console.error(error2);
      
      res.status(500).json({ error: 'Internal Server Error' });
    }
    
  });

  router.post("/author/accept_request", async (req, res) => {
    try {
        const { user_id, poster_id } = req.body;
  
        // Insert data into paperReviewer table
        const result = await db.from('posterAuthor').insert([{ poster_id, user_id }]);
  
        res.status(200).json({ message: 'Poster accepted successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  router.get("/author/get_request/:user_id", async (req, res) => {
    try {
  
      const user_id = req.params.user_id;
  
      // console.log(user_id);
  
  
  
      var { data, error } = await db //fetching data from poster table.
        .from('author_poster_request')
        .select('*')
        .eq('user_id', user_id); 
  
      //   data = data.flat();
  
      const posterIds = [...new Set(data.map(item => item.poster_id))];
  
  
  
      // console.log(paperIds);
  
      let poster_info = [];
      for(let i = 0; i<posterIds.length; i++){
  
          let pid = posterIds[i];
          var {data, error} = await db
          .from('poster')
          .select('*')
          .eq('poster_id' , pid);
  
  
          poster_info.push(data);
      }
  
      poster_info =  poster_info.flat();
     
      // console.log(paper_info);
  
  
  
      //   console.log(data);
  
      res.status(200).json(poster_info);
  
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  router.get("/author/get_request/:user_id/:poster_id", async (req, res) => {
    try {
  
      const user_id = req.params.user_id;
      const poster_id = req.params.poster_id;
  
      // console.log(user_id);
  
  
  
      var { data, error } = await db //fetching data from paper table.
        .from('author_poster_request')
        .select('*')
        .eq('user_id', user_id)
        .eq('poster_id',poster_id); 
  
      //   data = data.flat();
  
      const posterIds = [...new Set(data.map(item => item.poster_id))];
  
  
  
      // console.log(paperIds);
  
      let poster_info = [];
      for(let i = 0; i<posterIds.length; i++){
  
          let pid = posterIds[i];
          var {data, error} = await db
          .from('poster')
          .select('*')
          .eq('poster_id' , pid);
  
  
          poster_info.push(data);
      }
  
      poster_info =  poster_info.flat();
     
      // console.log(paper_info);
  
  
  
      //   console.log(data);
  
      res.status(200).json(poster_info);
  
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  router.post("/submit", async (req, res) => {
    try {
      
    //   const rifat = "c89a31f7-da91-42a8-8c6e-9cf5a47742a8";
    //   const avi =   "0aa34e07-985a-42ec-8299-48db5ab0581d";
    //   const rakib = "53012147-ccd7-4179-8166-76270223a9f2";
    //   const nafi =  "b51d5f7c-f023-4e07-aa94-45af7b9340c7";
    //   const piol =  "66df2a4d-0ad9-462d-9953-d2453c2b2175";

    //   var paper1,paper2 , paper3;

    //   paper1 = "7b3b5479-e7c9-4298-8432-07a95f34ef9b";
    //   paper2 = "2b8d62f2-fa14-4ce1-9d78-3f132fbe7d98";
    //   paper3 = "31ad3d24-a21e-4191-9cd9-c3e1bfef251e";


    //   const paper_id = paper2;

      // let user_id = avi; // this is just to  test the db, actual author_id will come from req.body
      let {poster_id, poster_title, abstract, pdf_link, related_fields , file ,co_authors,main_author_id,conference_id} = req.body;
      
      poster_id = uuidv4();

      // console.log(req.body)
      
      
      let author_id_arr = []
      for(let i=0;i<co_authors.length;i++)
      {
        author_id_arr = [...author_id_arr,co_authors[i].user_id]
      }
      // author_id_arr = [main_author_id, ... author_id_arr]


  
      const { data, error } = await db
        .from('poster')
        .insert([
          {
            poster_id,
            poster_title,
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
          .from('author_poster_request')
          .insert
          ([
              {
                  poster_id,
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
      .from('posterAuthor')
      .insert
      ([
          {
              poster_id,
              user_id
          }
      ]
      );
    

      if ( error3) {
        throw error;
      }




      res.status(201).json(poster_id);
    } catch (error2) {
      console.error(error2);
      
      res.status(500).json({ error: 'Internal Server Error' });
    }
    
  });


  router.get("/:poster_id",async (req,res) => 
{
  try {
      const poster_id = req.params.poster_id;
      const { data, error } = await db
        .from('poster')
        .select('*')
        .eq('poster_id', poster_id);
  
      if (error) {
        throw error;
      }
  
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }

});

router.get("/:poster_id/author",async (req,res) => 
{
  try {
      const poster_id = req.params.poster_id;

      
      const { data, error } = await db
        .from('posterAuthor')
        .select(`user(user_id,first_name,last_name,current_institution)`)
        
        .eq('poster_id', poster_id);
  
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

router.get("/assign/auto/:poster_id", async (req, res) => {
    try {
  
       const poster_id = req.params.poster_id;
 
  
      var already_assigned = [];

      var {data, error} = await db
        .from('requestPoster')
        .select('user_id').eq('poster_id',poster_id);
  
  
        let already_requested = data.map(item =>item.user_id);
  
        var {data, error} = await db
        .from('assignedPosterReviewer')
        .select('user_id').eq('poster_id',poster_id);
  
  
        let already_accepted = data.map(item =>item.user_id);  
  
        already_assigned = [...already_accepted , ...already_requested];
  
        const temp_unique = new Set(already_assigned);
  
        already_assigned = [...temp_unique];
  
      
  
  
  
      var { data, error } = await db //fetching data from paper table.
        .from('poster')
        .select('*')
        .eq('poster_id', poster_id); // needs to be equal to paper_id, that means infos corresponding to that specific id will come
  
      var related_fields = data.map(item => item.related_fields); // from that data, the fields that the paper has will be selected (cutting off the unneccessary data)
  
      related_fields = related_fields.flat(); // flattening the array to get rid of annoying [] 's
  
      // console.log("RELATED fields");
      // console.log(related_fields);
  
  
  
  
      var {data, error} = await db // similarly data will be fetched from paperAuthor table to get the author info
          .from('posterAuthor')
          .select('*')
          .eq('poster_id', poster_id);
  
      var authors = data.map(item => item.user_id); // making an array of only the author ids.
  
      authors = authors.flat(); // similar to previous one
  
      // console.log("author id");
      // console.log(authors);
  
  
      var {data, error} = await db // all user info are extracted
      .from('user')
      .select('*')
      
     
      var all_expertise = data.map(({user_id, expertise , current_institution}) => ({user_id, expertise, current_institution})); // from that data, only 3 fields are selected, user_id, expertise, institution
  
  
      var related_institution = all_expertise.filter(item => authors.includes(item.user_id)).map(item => item.current_institution);
      /*
      explanation of above line:
      at first filter is used . this is to filter out all the data that matches with the author id.
      Then from those values, their institutions are selected, 
      thus we  get an array of author's institutions
      */
  
      // console.log("related institution");
      // console.log(related_institution);
  
      console.log("related fields  printing");
      console.log(all_expertise);
      console.log("all expertise  printing");
      
  
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
  
  
      possible_user_id = possible_user_id.filter(user =>  !related_institution.includes(user.current_institution));
  
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
      poster_id = req.body.poster_id
      poster_title = req.body.poster_title
      
      
  
      let request_id = uuidv4();
  
      const { data, error } = await db
        .from('requestPoster')
        .insert([
          {
            user_id : user_id,
            poster_id : poster_id,
            request_id : request_id
          },
        ]);
  
      if (error) {
        throw error;
      }
  
      // console.log("does it come here");
  
  
      res.status(201).json("Request sent");
  
  
      let notification_JSON = {
  
        type: 'reviewer_request',
        requested_user_id : user_id,
        requested_poster_id : poster_id,
        requested_poster_title : poster_title
      }
  
      let notification_id = uuidv4()
  
      let notification_body = "You are requested to review the following paper";
  
      
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

  router.post("/assign/request", async (req, res) => {
    try {
  
      user_id = req.body.user_id
      poster_id = req.body.poster_id
      poster_title = req.body.poster_title
      
      
  
      let request_id = uuidv4();
  
      const { data, error } = await db
        .from('requestPoster')
        .insert([
          {
            user_id : user_id,
            poster_id : poster_id,
            request_id : request_id
          },
        ]);
  
      if (error) {
        throw error;
      }
  
      // console.log("does it come here");
  
  
      res.status(201).json("Request sent");
  
  
      let notification_JSON = {
  
        type: 'reviewer_request',
        requested_user_id : user_id,
        requested_poster_id : poster_id,
        requested_poster_title : poster_title
      }
  
      let notification_id = uuidv4()
  
      let notification_body = "You are requested to review the following poster";
  
      
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
      
      const poster_id = req.body.poster_id;
  
      const user_id = req.body.user_id;
      
      // console.log(paper_id,user_id,"delete")
  
      const { data, error } = await db
        .from('requestPoster')
        .delete()
        .match({"user_id":user_id , "poster_id":poster_id});
  
        await db
        .from('notification')
        .delete()
        .match({"user_id":user_id});
  
  
        res.status(201).json("deleted successfully");
  
      if (error) {
        throw error;
      }
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  router.get("/assign/sent_request/:poster_id", async (req, res) => {
    try {
  
       
      const poster_id = req.params.poster_id;
  
      // console.log(paper_id)
  
      
      //let paper_id = "31ad3d24-a21e-4191-9cd9-c3e1bfef251e";
      
      
      const { data, error } = await db
        .from('requestPoster')
        .select('*')
        .eq("poster_id",poster_id);
  
  
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



  
router.get("/assign/manual/:poster_id", async (req, res) => {
  try {

      const poster_id = req.params.poster_id;



    // const paper1 = "7b3b5479-e7c9-4298-8432-07a95f34ef9b";
    // const paper2 = "2b8d62f2-fa14-4ce1-9d78-3f132fbe7d98";
    // const paper3 = "31ad3d24-a21e-4191-9cd9-c3e1bfef251e";

    //const paper_id = paper3;

    var already_assigned = [];
    //already_assigned.push("66df2a4d-0ad9-462d-9953-d2453c2b2175"); // reviewers that are already assinged


    var {data, error} = await db
      .from('requestPoster')
      .select('user_id').eq('poster_id',poster_id);


      let already_requested = data.map(item =>item.user_id);

      var {data, error} = await db
      .from('assignedPosterReviewer')
      .select('user_id').eq('poster_id',poster_id);


      let already_accepted = data.map(item =>item.user_id);  

      already_assigned = [...already_accepted , ...already_requested];

      const temp_unique = new Set(already_assigned);

      already_assigned = [...temp_unique];

      // already_assigned = [];

      // console.log("already assigned");

      // console.log(already_assigned);




    var { data, error } = await db //fetching data from paper table.
      .from('poster')
      .select('*')
      .eq('poster_id', poster_id); // needs to be equal to paper_id, that means infos corresponding to that specific id will come

    var related_fields = data.map(item => item.related_fields); // from that data, the fields that the paper has will be selected (cutting off the unneccessary data)

    related_fields = related_fields.flat(); // flattening the array to get rid of annoying [] 's

    // console.log("RELATED fields");
    // console.log(related_fields);




    var {data, error} = await db // similarly data will be fetched from paperAuthor table to get the author info
        .from('posterAuthor')
        .select('*')
        .eq('poster_id', poster_id);

    var authors = data.map(item => item.user_id); // making an array of only the author ids.

    authors = authors.flat(); // similar to previous one

    // console.log("author id");
    // console.log(authors);


    var {data, error} = await db // all user info are extracted
    .from('user')
    .select('*')
    
   
    var all_expertise = data.map(({user_id, expertise}) => ({user_id, expertise})); // from that data, only 3 fields are selected, user_id, expertise, institution


    // var related_institution = all_expertise.filter(item => authors.includes(item.user_id)).map(item => item.current_institution);
    /*
    explanation of above line: // commented out code
    at first filter is used . this is to filter out all the data that matches with the author id.
    Then from those values, their institutions are selected, 
    thus we  get an array of author's institutions
    */


    var possible_user_id = all_expertise.filter(user => {
        return related_fields.some(keyword => user.expertise.includes(keyword));
    });

    /*
    explanation:
    filter is used on all_expertise. Inside the filter, "user" is a placeholder for all_expertise values. 
    then user.expertise value is checked against the related fields values.
    Any value that is in related_fields will be inside the possible_user_id
    */

    // console.log("possible user id");
    // console.log(possible_user_id);


    // possible_user_id = possible_user_id.filter(user =>  !related_institution.includes(user.current_institution));

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

     let allAuthorName = []

  
    
    if(actual_reviewer_id.length === 0){ // to check if there is any reviewer or not
        
      // console.log("is empty");
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

    // console.log(related_fields);
    // console.log(authors);
    // console.log(all_expertise);
    // console.log(possible_user_id);
    // console.log(actual_reviewer_id);

    // console.log(data_paperAuthor);

    
    
    // res.status(200).json(authors);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get("/reviewer/assigned/:poster_id", async (req, res) => {
  try {

      const poster_id = req.params.poster_id;
      const { data , error } = await db.from('assignedPosterReviewer').select('user(*)').eq('poster_id',poster_id);

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


router.get("/getConferenceInfo/:poster_id",async (req,res) =>   //retrives conference id,title and paper_title
{
  try {
      const poster_id = req.params.poster_id;

      let result = {
        poster_title : null,
        conference_id : null,
        conference_title : null
      };

      const { data, error } = await db
        .from('poster')
        .select('poster_title,conference_id')
        .eq('poster_id', poster_id);
  
      if (error) {
        throw error;
      }

      result.poster_title = data[0].poster_title
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


router.get("/all_authors/:poster_id", async (req, res) => {
  try {
    // get all the papers of a user
    const poster_id = req.params.poster_id;

    const { data, error } = await db
      .from('posterAuthor')
      .select('user_id')
      .eq('poster_id', poster_id);

    if (error) {  
      throw error;
    } else { 
      res.status(200).json(data);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});






router.get("/request/:user_id", async (req, res) => {
  try {

    const user_id = req.params.user_id;

    // console.log(user_id);



    var { data, error } = await db //fetching data from paper table.
      .from('requestPoster')
      .select('*')
      .eq('user_id', user_id); 

    //   data = data.flat();

    const PosterIds = [...new Set(data.map(item => item.poster_id))];



    // console.log(PaperIds);

    let poster_info = [];
    for(let i = 0; i<PosterIds.length; i++){

        let pid = PosterIds[i];
        var {data, error} = await db
        .from('poster')
        .select('*')
        .eq('poster_id' , pid);


        poster_info.push(data);
    }

    poster_info =  poster_info.flat();
    console.log(poster_info);



    //   console.log(data);

    res.status(200).json(poster_info);

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.post("/request/delete_request", async (req, res) => {
  try {


      let {user_id, poster_id} = req.body;
    

      let request_id = (await db
      .from('requestPoster').select('request_id')
      .match({"user_id":user_id , "poster_id":poster_id})).data;
      
      request_id = request_id[0].request_id

      console.log("request id print korchi")
      console.log(request_id)

      let notification_id = (await db
      .from('requestNotification').select('notification_id')
      .eq("request_id",request_id)).data

      
      console.log("notification id print korchi")
      console.log(notification_id)
      notification_id = notification_id[0].notification_id
      

      

      
  //   const paper_id = paper2;

  //   let user_id = avi; // this is just to  test the db, actual author_id will come from req.body
  //   let {paper_id, paper_title, abstract, pdf_link, related_fields , file ,co_authors,main_author_id,conference_id} = req.body;
    

    const { data, error } = await db
      .from('requestPoster')
      .delete()
      .match({"user_id":user_id , "poster_id":poster_id});



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


router.get("/get_conference_chair/:poster_id", async (req, res) => { //retrieves paper info based on paper id
  try {

    const poster_id = req.params.poster_id;

    let { data, error } = await db
      .from('poster')
      .select('conference_id')
      .eq('poster_id', poster_id);

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


  router.get("/user/getFullName/:user_id", async (req, res) => {
    try {
      const userId = req.params.user_id;
  
      
      const { data } = await db.from('user').select('first_name,last_name').eq('user_id', userId);
      
      if (data.length === 0) {
        res.status(404).send('User not found');
      } else {
        res.json(data[0].first_name + ' ' + data[0].last_name);
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  });


  router.post("/reviewer/accept", async (req, res) => {
    try {
        const { user_id, poster_id } = req.body;

        // Insert data into paperReviewer table
        const result = await db.from('assignedPosterReviewer').insert([{ user_id, poster_id }]);

        res.status(200).json({ message: 'Poster accepted successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.get("/get_conference/:poster_id", async (req, res) => { //retrieves paper info based on paper id
  try {

    let poster_id = req.params.poster_id;

    const { data, error } = await db
      .from('poster')
      .select('*')
      .eq('poster_id', poster_id);

    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put("/reviewer/review", async (req, res) => {
  try {
      const { user_id, poster_id, rating, review } = req.body;

      // Update data in paperReviewer table based on user_id and paper_id
      const result = await db.from('assignedPosterReviewer')
          .update({ rating, review })
          .eq('user_id', user_id)
          .eq('poster_id', poster_id);

      res.status(200).json({ message: 'Review updated successfully'});
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get("/reviewer/assignedPosters/:user_id", async (req, res) => {
  try {
    
    const user_id = req.params.user_id;

    const { data } = await db.from('assignedPosterReviewer').select('poster_id, rating, review, poster( poster_title, abstract, pdf_link, related_fields,status)').eq('user_id', user_id);
    

    // change the data array so that every item is directly of the json.. not data[0].papr.paper_title . rather data[0].paper_title

    // Restructure the data array
    const restructuredData = data.map(item => ({
          poster_id: item.poster_id,
          rating: item.rating,
          review: item.review,
          review_status: item.rating !== null && item.review !== null ? "reviewed" : "not reviewed",
          poster_status: item.poster.status,
          ...item.poster
     }));

     for(let i=0; i<restructuredData.length; i++)
     {
      const { data: revisedData } = await db.from('revisePaperSubmission').select('*').eq('poster_id', restructuredData[i].poster_id);

      if(revisedData.length > 0)
      {
          const currentDate = new Date();

          restructuredData[i].submission_deadline = revisedData[0].deadline;

           const submissionDeadline = new Date(
          `${restructuredData[i].submission_deadline.date}T${restructuredData[i].submission_deadline.time}`);

          if (submissionDeadline < currentDate) restructuredData[i].submission_status = "closed";
          else restructuredData[i].submission_status = "open";
      }
     }

     res.json(restructuredData);


  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});



router.get("/mysubmission/:conference_id/:user_id", async (req, res) => { //retrieves paper info based on paper id
  try {

    const user_id = req.params.user_id;
    const conference_id = req.params.conference_id;

    let { data, error } = (await db
      .from('poster')
      .select('posterAuthor(poster_id,user_id)')
      .eq('conference_id', conference_id));

    if (error) {
      throw error;
    }

    let poster_ids = []

    let author_ids = []

    for(let i=0;i<data.length;i++)
    {
        let temp = data[i].posterAuthor

      for(let j=0;j<temp.length;j++)
      {
          if(temp[j].user_id == user_id)
          {
          poster_ids.push(temp[j].poster_id)
          }
      }
    }

    let myPosters = []
    for(let i=0;i<poster_ids.length;i++)
    {


      let poster_details = (await db
      .from('poster')
      .select('*')
      .eq('poster_id', poster_ids[i])).data[0];

        let author_details = (await db
        .from('posterAuthor')
        .select(`user(user_id,first_name,last_name,current_institution)`)
        .eq('poster_id', poster_ids[i])).data;

        let review_details = (await db
        .from ('assignedPosterReviewer')
        .select('*')
        .eq('poster_id', poster_ids[i])).data;

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

      

        poster_details.authors = authors

        poster_details["reviews"] = reviews

        
        // const { data: revisedData } = await db.from('revisePaperSubmission').select('*').eq('paper_id', paper_details.paper_id);
        
        // if(revisedData.length > 0)
        // {
        //    const currentDate = new Date();

        //     paper_details.submission_deadline = revisedData[0].deadline;

        //      const submissionDeadline = new Date(
        //     `${paper_details.submission_deadline.date}T${paper_details.submission_deadline.time}`);

        //     if (submissionDeadline < currentDate)
        //     {
        //       paper_details.submission_status = "closed";
              
        //       // await db
        //       // .from('paper')
        //       // .update({status: 'revise'})
        //       // .eq("paper_id" , paper_details.paper_id);

        //     }
        //     else paper_details.submission_status = "open";
        // }
        // // console.log("paper details printing")
        // // console.log(paper_details)

        const { data: conferenceDeadline } = await db.from('poster').select('conference(conference_id,submission_deadline)').eq('poster_id', poster_details.poster_id);
        
        let conference_deadline = conferenceDeadline[0].conference.submission_deadline;
        const currentDate = new Date();
        poster_details.conference_deadline = conference_deadline;

         const confsubmissionDeadline = new Date(
            `${poster_details.conference_deadline.date}T${poster_details.conference_deadline.time}`);

            if (confsubmissionDeadline < currentDate)
            {
              poster_details.conference_submission_status = "closed";
            }
            else
            {
              poster_details.conference_submission_status = "open";
            }

      myPapers.push(poster_details)

        
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



router.post("/delete_submission", async (req, res) => {

  let {poster_id} = req.body;

  // console.log(paper_id,"for delete")

  const { data, error } = await db
      .from('poster')
      .delete()
      .match({"poster_id":poster_id});


});



module.exports = router;
