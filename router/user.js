const express = require('express');
const db = require('../db/database'); 

const router = express.Router();


// user_id ( int) , first_name (text), last_name(text), date_of_birth(date), email(text), current_institution(text), personal_links(array of text), expertise ( array of text)


router.post("/add")



router.get("/all")


router.get("/:user_id")


router.delete("/:user_id")


module.exports = router;