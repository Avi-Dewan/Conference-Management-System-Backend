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

module.exports = router;
