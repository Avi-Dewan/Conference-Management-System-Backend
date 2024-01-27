const express = require('express');
const db = require('../db/database');  // Assuming you have a Supabase-compatible database object

const router = express.Router();



// Get all conferences
router.get("/:paper_id", async (req, res) => {
  try {

    // const paper_id = req.params.paper_id;



    const paper1 = "7b3b5479-e7c9-4298-8432-07a95f34ef9b";
    const paper2 = "2b8d62f2-fa14-4ce1-9d78-3f132fbe7d98";
    const paper3 = "31ad3d24-a21e-4191-9cd9-c3e1bfef251e";

    const paper_id = paper1;


    var { data, error } = await db
      .from('paper')
      .select('*')
      .eq('paper_id', paper_id);

    var related_fields = data.map(item => item.related_fields);

    related_fields = related_fields.flat(); // this will be the filter



    var {data, error} = await db
        .from('paperAuthor')
        .select('*')
        .eq('paper_id', paper_id);

    var authors = data.map(item => item.user_id);

    authors = authors.flat();



    var {data, error} = await db
    .from('user')
    .select('*')
    
    var all_expertise = data.map(({user_id, expertise}) => ({user_id, expertise}));

    console.log(all_expertise);

    // all_expertise = all_expertise.flat();



    var possible_user_id = all_expertise.filter(user => {
        return related_fields.some(keyword => user.expertise.includes(keyword));
    });

    console.log(possible_user_id);





    

    var actual_reviewer_id = possible_user_id.filter(user => !authors.includes(user.user_id));


    if(actual_reviewer_id.length === 0){
        res.status(200).json("kothao keu nei");
    }
    else{
        actual_reviewer_id = actual_reviewer_id.map(user => user.user_id);
        res.status(200).json(actual_reviewer_id);
    }









    

    // if (error) {
    //   throw error;
    // }

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






module.exports = router;
