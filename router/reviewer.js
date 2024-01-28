const express = require('express');
const db = require('../db/database'); // a superbase instance

const router = express.Router();

// Endpoint to accept a paper
router.post("/accept", async (req, res) => {
    try {
        const { user_id, paper_id } = req.body;

        // Insert data into paperReviewer table
        const result = await db.from('assignedReviewer').insert([{ user_id, paper_id }]);

        res.status(200).json({ message: 'Paper accepted successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to update rating and review
router.put("/review", async (req, res) => {
    try {
        const { user_id, paper_id, rating, review } = req.body;

        // Update data in paperReviewer table based on user_id and paper_id
        const result = await db.from('assignedReviewer')
            .update({ rating, review })
            .eq('user_id', user_id)
            .eq('paper_id', paper_id);

        res.status(200).json({ message: 'Review updated successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// get conference paper details ( with authors)
// we have a paper table ( primary key = paper_id, foreign id = conference_id)
// we have // paperReviewer table: primary_key(user_id, paper_id), rating and review


router.get("/assignedPapers/:user_id", async (req, res) => {
    try {
      
      const user_id = req.params.user_id;

      const { data } = await db.from('assignedReviewer').select('paper_id, rating, review, paper( paper_title, abstract, pdf_link, related_fields)').eq('user_id', user_id);

      // change the data array so that every item is directly of the json.. not data[0].papr.paper_title . rather data[0].paper_title

      // Restructure the data array
      const restructuredData = data.map(item => ({
            paper_id: item.paper_id,
            rating: item.rating,
            review: item.review,
            review_status: item.rating !== null && item.review !== null ? "reviewed" : "not reviewed",
            ...item.paper
       }));

       res.json(restructuredData);


    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
});

router.get("/assigned", async (req, res) => {
    try {
        const { data } = await db.from('assignedReviewer').select('user(*)');

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

        res.json(flattenedData);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;
