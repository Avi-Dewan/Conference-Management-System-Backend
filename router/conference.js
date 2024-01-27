const express = require('express');
const db = require('../db/database');  // Assuming you have a Supabase-compatible database object

const router = express.Router();

// Create a new conference
router.post("/create", async (req, res) => {
  try {
    const { conference_title, conference_description, conference_webpage, venue,  start_date, end_date, submission_deadline, related_fields } = req.body;

    const { data, error } = await db
      .from('conference')
      .insert([
        {
          conference_title,
          conference_description,
          venue,
          conference_webpage,
          start_date,
          end_date,
          submission_deadline,
          related_fields,
        },
      ]);

    if (error) {
      throw error;
    }

    res.status(201).json("Conference created successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all conferences
router.get("/all", async (req, res) => {
  try {
    const { data, error } = await db
      .from('conference')
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

// Get conferences with status = open
router.get("/open", async (req, res) => {
  try {
    const currentDate = new Date();

    const { data, error } = await db
      .from('conference')
      .select('*');

    if (error) {
      throw error;
    }

    const openConferences = data.filter(conference => {
      const submissionDeadline = new Date(`${conference.submission_deadline.date}T${conference.submission_deadline.time}`);
      return (currentDate < submissionDeadline) && (conference.status = 'Open');
    });
    console.log(openConferences)
    res.status(200).json(openConferences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Get a specific conference by ID
router.get("/:conference_id", async (req, res) => {
  try {
    const conference_id = req.params.conference_id;

    const { data, error } = await db
      .from('conference')
      .select('*')
      .eq('conference_id', conference_id);

    if (error) {
      throw error;
    }

    res.status(200).json(data[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// get conference paper details ( without authors)

router.get("/:conference_id/papers", async (req, res) => {
  try {
    const conference_id = req.params.conference_id;

    const { data, error } = await db
      .from('paper')
      .select('*')
      .eq('conference_id', conference_id);
    
    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// get conference paper details ( with authors)
// we have a paper table ( primary key = paper_id, foreign id = conference_id)
// we have a paperAuthor table( primary_key = ( paper_id, user_id))
// we have user table( primary key = user_id, first_name, last_name)


// router.get("/:conference_id/papersWithAuthors", async (req, res) => {
//   try {
//     const conference_id = req.params.conference_id;

// // from the paper table chose those papers who has same conference_id 
// // from those papers get user_id's from paperAuthor using paper_id for every paper, 
// // So, every paper_id has few user_ids.. using those ids get the full_name = first_name + last_name from user table

// // so, out final result is an array of papers ( every paper has paper details and array of full_name of users)
//     if (error) {
//       throw error;
//     }

//     res.status(200).json(data[0]);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });



// get conference paper details (with authors)
router.get("/:conference_id/papersWithAuthors", async (req, res) => {
  try {
    const conference_id = req.params.conference_id;

    // Fetch papers for the given conference_id
    const { data: papers, error: papersError } = await db
      .from('paper')
      .select('*')
      .eq('conference_id', conference_id);

    if (papersError) {
      throw papersError;
    }

    // Fetch authors for each paper
    const papersWithAuthors = await Promise.all(
      papers.map(async (paper) => {
        const { data: authors, error: authorsError } = await db
          .from('paperAuthor')
          .select('user_id')
          .eq('paper_id', paper.paper_id);

        if (authorsError) {
          throw authorsError;
        }

        // Fetch full names of authors
        const authorNames = await Promise.all(
          authors.map(async (author) => {
            const { data: user, error: userError } = await db
              .from('user')
              .select('*')
              .eq('user_id', author.user_id)
              .single();

            if (userError) {
              throw userError;
            }

            return `${user.first_name} ${user.last_name}`;
          })
        );

        // Add author names to the paper
        return {
          ...paper,
          authors: authorNames,
        };
      })
    );

    res.status(200).json(papersWithAuthors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// tell whether conference char or not

module.exports = router;
