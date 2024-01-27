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


    var { data, error } = await db //fetching data from paper table.
      .from('paper')
      .select('*')
      .eq('paper_id', paper_id); // needs to be equal to paper_id, that means infos corresponding to that specific id will come

    var related_fields = data.map(item => item.related_fields); // from that data, the fields that the paper has will be selected (cutting off the unneccessary data)

    related_fields = related_fields.flat(); // flattening the array to get rid of annoying [] 's




    var {data, error} = await db // similarly data will be fetched from paperAuthor table to get the author info
        .from('paperAuthor')
        .select('*')
        .eq('paper_id', paper_id);

    var authors = data.map(item => item.user_id); // making an array of only the author ids.

    authors = authors.flat(); // similar to previous one


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



    var possible_user_id = all_expertise.filter(user => {
        return related_fields.some(keyword => user.expertise.includes(keyword));
    });

    /*
    explanation:
    filter is used on all_expertise. Inside the filter, "user" is a placeholder for all_expertise values. 
    then user.expertise value is checked against the related fields values.
    Any value that is in related_fields will be inside the possible_user_id
    */




    possible_user_id = possible_user_id.filter(user =>  !related_institution.includes(user.current_institution));

    /*
    more filtering is used to filter out the instittution that matches with the author
    */
    
    

    var actual_reviewer_id = possible_user_id.filter(user => !authors.includes(user.user_id));
    /*
    finally, the id's that matches with the author will be discarded
    */

    if(actual_reviewer_id.length === 0){ // to check if there is any reviewer or not
        res.status(200).json("kothao keu nei");
    }
    else{
        actual_reviewer_id = actual_reviewer_id.map(user => user.user_id); // extract only the reviewer id, and remove other data
        res.status(200).json(actual_reviewer_id);
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






module.exports = router;
