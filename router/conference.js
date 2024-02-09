const express = require('express');
const db = require('../db/database');  // Assuming you have a Supabase-compatible database object
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Create a new conference
router.post("/create", async (req, res) => {
  try {
    const { conference_title, conference_description, conference_webpage, venue,  start_date, end_date, submission_deadline, related_fields, chair_id } = req.body;


    let conference_id = uuidv4();

    const { data, error } = await db
      .from('conference')
      .insert([
        {
          conference_id : conference_id,
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

     await db
      .from('conferenceChair')
      .insert([
        {
          user_id : chair_id,
          conference_id : conference_id


        }]);


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


// Get all conferences of an user_id
router.get("/:creator_id/all", async (req, res) => {
  try {
    const creator_id = req.params.creator_id;

    const { data, error } = await db
      .from('conferenceChair')
      .select('conference_id'
      
      ).eq('user_id',creator_id)
      

    if (error) {
      throw error;
    }

    let finalData = []

    

     
     for(let k=0;k<data.length;k++)
     {
      

        let result = {

        conference_id : null,
        conference_title : null,
        submitted_paper_count : null,
        
        paper_count_with_no_reviewer_assigned: null,

        paper_count_with_pending_review : null,

        workshop_count : null

      }
       
       let conference_details =  (await db
        .from('conference')
        .select('conference_title').eq('conference_id',data[k].conference_id)).data

       
       let workshops = (await db
        .from('workshop')
        .select('workshop_id').eq('conference_id',data[k].conference_id)).data
       
        if(workshops == null)
          result.workshop_count = 0
        else
          result.workshop_count = workshops.length
       let papers = (await db
        .from('paper')
        .select('paper_id,paper_title'
        
        ).eq('conference_id',data[k].conference_id)).data

        result.conference_id = data[k].conference_id
        result.conference_title = conference_details[0].conference_title

        if(papers == null) result.submitted_paper_count = 0
        else
        result.submitted_paper_count = papers.length

        let notAssignedCount = 0;

        let pendingReviewCount = 0;
        for(let i=0;i<papers.length;i++)
        {
            let assignedReviewer = (await db
                .from('assignedReviewer')
                .select('user_id,rating,review'
                
                ).eq('paper_id',papers[i].paper_id)).data

                if(assignedReviewer == null || assignedReviewer.length == 0)
                {
                  notAssignedCount++;
                }
                
                for(let z = 0; z<assignedReviewer.length;z++)
                {
                  if(assignedReviewer[z].rating == null && assignedReviewer[z].review == null)
                  {
                      pendingReviewCount++;
                  }
                }
        }

        result.paper_count_with_no_reviewer_assigned = notAssignedCount
        result.paper_count_with_pending_review = pendingReviewCount

        finalData.push(result)
        
    }

    res.status(200).json(finalData);
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
// we have  request table ( user_id, paper_id)
// we have assignedReviewer ( paper_id, user_id, rating, review)
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

        // console.log(authorNames);

       // Fetch requested reviewers for the paper
       const { data: requestedReviewers, error: reviewersError } = await db
          .from('request')
          .select('user_id')
          .eq('paper_id', paper.paper_id);

        if (reviewersError) {
          throw reviewersError;
        }

      // Fetch full names of requested reviewers
      const reviewerNames = await Promise.all(
        requestedReviewers.map(async (reviewer) => {
          const { data: user, error: userError } = await db
            .from('user')
            .select('*')
            .eq('user_id', reviewer.user_id)
            .single();

          if (userError) {
            throw userError;
          }

          return `${user.first_name} ${user.last_name}`;
        })
      );

      // console.log(reviewerNames);

     // Fetch reviews for the paper
     const { data: reviews, error: reviewsError } = await db
       .from('assignedReviewer')
       .select('user_id, rating, review, user(first_name, last_name)')
       .eq('paper_id', paper.paper_id);

     if (reviewsError) {
       throw reviewsError;
     }


     // Add full_name field to each reviewer
     const reviewsWithFullName = reviews.map((reviewer) => ({
      user_id: `${reviewer.user_id}`,
      rating: reviewer.rating,
      review: `${reviewer.review}`,
      full_name: `${reviewer.user.first_name} ${reviewer.user.last_name}`,
    }));


     // Add additional information to the paper
     return {
       ...paper,
       authors: authorNames,
       requestedReviewers: reviewerNames,
       reviews: reviewsWithFullName,
     };

        // i also want 2 more info for each paper
        // requestedReviewers: full name just like authors but those users who has user_id, paper_id in request table
        // reviews: reviews from assignedReview table which mathces paper_id 
      })
    );

    res.status(200).json(papersWithAuthors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get("/:conference_id/papersWithAuthors/:paper_id", async (req, res) => {
  try {
    const conference_id = req.params.conference_id;
    const paper_id = req.params.paper_id;

    // Fetch papers for the given conference_id
    const { data: papers, error: papersError } = await db
      .from('paper')
      .select('*')
      .eq('paper_id', paper_id);

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

        // console.log(authorNames);

       // Fetch requested reviewers for the paper
       const { data: requestedReviewers, error: reviewersError } = await db
          .from('request')
          .select('user_id')
          .eq('paper_id', paper.paper_id);

        if (reviewersError) {
          throw reviewersError;
        }

      // Fetch full names of requested reviewers
      const reviewerNames = await Promise.all(
        requestedReviewers.map(async (reviewer) => {
          const { data: user, error: userError } = await db
            .from('user')
            .select('*')
            .eq('user_id', reviewer.user_id)
            .single();

          if (userError) {
            throw userError;
          }

          return `${user.first_name} ${user.last_name}`;
        })
      );

      // console.log(reviewerNames);

     // Fetch reviews for the paper
     const { data: reviews, error: reviewsError } = await db
       .from('assignedReviewer')
       .select('user_id, rating, review, user(first_name, last_name)')
       .eq('paper_id', paper.paper_id);

     if (reviewsError) {
       throw reviewsError;
     }


     // Add full_name field to each reviewer
     const reviewsWithFullName = reviews.map((reviewer) => ({
      user_id: `${reviewer.user_id}`,
      rating: reviewer.rating,
      review: `${reviewer.review}`,
      full_name: `${reviewer.user.first_name} ${reviewer.user.last_name}`,
    }));


     // Add additional information to the paper
     return {
       ...paper,
       authors: authorNames,
       requestedReviewers: reviewerNames,
       reviews: reviewsWithFullName,
     };

        // i also want 2 more info for each paper
        // requestedReviewers: full name just like authors but those users who has user_id, paper_id in request table
        // reviews: reviews from assignedReview table which mathces paper_id 
      })
    );

    res.status(200).json(papersWithAuthors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get("/:conference_id/viewUnassaignedPapers", async (req, res) => {
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

    let filteredPapers = []
    for(let i=0;i<papers.length;i++)
    {
      let reviewer = (await db
      .from('assignedReviewer')
      .select('user_id')
      .eq('paper_id', papers[i].paper_id)).data;

      if(reviewer == null || reviewer.length == 0)
      {
        filteredPapers.push(papers[i])
      }
    }

   

    // Fetch authors for each paper
    const papersWithAuthors = await Promise.all(
      filteredPapers.map(async (paper) => {
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

        // console.log(authorNames);

       // Fetch requested reviewers for the paper
       const { data: requestedReviewers, error: reviewersError } = await db
          .from('request')
          .select('user_id')
          .eq('paper_id', paper.paper_id);

        if (reviewersError) {
          throw reviewersError;
        }

      // Fetch full names of requested reviewers
      const reviewerNames = await Promise.all(
        requestedReviewers.map(async (reviewer) => {
          const { data: user, error: userError } = await db
            .from('user')
            .select('*')
            .eq('user_id', reviewer.user_id)
            .single();

          if (userError) {
            throw userError;
          }

          return `${user.first_name} ${user.last_name}`;
        })
      );

      // console.log(reviewerNames);

     // Fetch reviews for the paper
     const { data: reviews, error: reviewsError } = await db
       .from('assignedReviewer')
       .select('user_id, rating, review, user(first_name, last_name)')
       .eq('paper_id', paper.paper_id);

     if (reviewsError) {
       throw reviewsError;
     }


     // Add full_name field to each reviewer
     const reviewsWithFullName = reviews.map((reviewer) => ({
      user_id: `${reviewer.user_id}`,
      rating: reviewer.rating,
      review: `${reviewer.review}`,
      full_name: `${reviewer.user.first_name} ${reviewer.user.last_name}`,
    }));


     // Add additional information to the paper
     return {
       ...paper,
       authors: authorNames,
       requestedReviewers: reviewerNames,
       reviews: reviewsWithFullName,
     };

        // i also want 2 more info for each paper
        // requestedReviewers: full name just like authors but those users who has user_id, paper_id in request table
        // reviews: reviews from assignedReview table which mathces paper_id 
      })
    );

    res.status(200).json(papersWithAuthors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get("/:conference_id/viewPendingReviewPapers/:paper_id", async (req, res) => {
  try {
    const conference_id = req.params.conference_id;
    const paper_id = req.params.paper_id;
    // Fetch papers for the given conference_id
    const { data: papers, error: papersError } = await db
      .from('paper')
      .select('*')
      .eq('paper_id', paper_id);

    if (papersError) {
      throw papersError;
    }

    let filteredPapers = []
    for(let i=0;i<papers.length;i++)
    {
      let reviewer = (await db
      .from('assignedReviewer')
      .select('user_id,rating,review')
      .eq('paper_id', papers[i].paper_id)).data;
      
      if(reviewer!=null && reviewer.length>0 && reviewer.rating == null && reviewer.review == null)
      {
        filteredPapers.push(papers[i]);
      }
      
    }

   

    // Fetch authors for each paper
    const papersWithAuthors = await Promise.all(
      filteredPapers.map(async (paper) => {
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

        // console.log(authorNames);

       // Fetch requested reviewers for the paper
       const { data: requestedReviewers, error: reviewersError } = await db
          .from('request')
          .select('user_id')
          .eq('paper_id', paper.paper_id);

        if (reviewersError) {
          throw reviewersError;
        }

      // Fetch full names of requested reviewers
      const reviewerNames = await Promise.all(
        requestedReviewers.map(async (reviewer) => {
          const { data: user, error: userError } = await db
            .from('user')
            .select('*')
            .eq('user_id', reviewer.user_id)
            .single();

          if (userError) {
            throw userError;
          }

          return `${user.first_name} ${user.last_name}`;
        })
      );

      // console.log(reviewerNames);

     // Fetch reviews for the paper
     const { data: reviews, error: reviewsError } = await db
       .from('assignedReviewer')
       .select('user_id, rating, review, user(first_name, last_name)')
       .eq('paper_id', paper.paper_id);

     if (reviewsError) {
       throw reviewsError;
     }


     // Add full_name field to each reviewer
     const reviewsWithFullName = reviews.map((reviewer) => ({
      user_id: `${reviewer.user_id}`,
      rating: reviewer.rating,
      review: `${reviewer.review}`,
      full_name: `${reviewer.user.first_name} ${reviewer.user.last_name}`,
    }));


     // Add additional information to the paper
     return {
       ...paper,
       authors: authorNames,
       requestedReviewers: reviewerNames,
       reviews: reviewsWithFullName,
     };

        // i also want 2 more info for each paper
        // requestedReviewers: full name just like authors but those users who has user_id, paper_id in request table
        // reviews: reviews from assignedReview table which mathces paper_id 
      })
    );

    res.status(200).json(papersWithAuthors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get("/:conference_id/viewPendingReviewPapers", async (req, res) => {
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

    let filteredPapers = []
    for(let i=0;i<papers.length;i++)
    {
      let reviewer = (await db
      .from('assignedReviewer')
      .select('user_id,rating,review')
      .eq('paper_id', papers[i].paper_id)).data;
      
      if(reviewer!=null && reviewer.length>0 && reviewer.rating == null && reviewer.review == null)
      {
        filteredPapers.push(papers[i]);
      }
      
    }

   

    // Fetch authors for each paper
    const papersWithAuthors = await Promise.all(
      filteredPapers.map(async (paper) => {
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

        // console.log(authorNames);

       // Fetch requested reviewers for the paper
       const { data: requestedReviewers, error: reviewersError } = await db
          .from('request')
          .select('user_id')
          .eq('paper_id', paper.paper_id);

        if (reviewersError) {
          throw reviewersError;
        }

      // Fetch full names of requested reviewers
      const reviewerNames = await Promise.all(
        requestedReviewers.map(async (reviewer) => {
          const { data: user, error: userError } = await db
            .from('user')
            .select('*')
            .eq('user_id', reviewer.user_id)
            .single();

          if (userError) {
            throw userError;
          }

          return `${user.first_name} ${user.last_name}`;
        })
      );

      // console.log(reviewerNames);

     // Fetch reviews for the paper
     const { data: reviews, error: reviewsError } = await db
       .from('assignedReviewer')
       .select('user_id, rating, review, user(first_name, last_name)')
       .eq('paper_id', paper.paper_id);

     if (reviewsError) {
       throw reviewsError;
     }


     // Add full_name field to each reviewer
     const reviewsWithFullName = reviews.map((reviewer) => ({
      user_id: `${reviewer.user_id}`,
      rating: reviewer.rating,
      review: `${reviewer.review}`,
      full_name: `${reviewer.user.first_name} ${reviewer.user.last_name}`,
    }));


     // Add additional information to the paper
     return {
       ...paper,
       authors: authorNames,
       requestedReviewers: reviewerNames,
       reviews: reviewsWithFullName,
     };

        // i also want 2 more info for each paper
        // requestedReviewers: full name just like authors but those users who has user_id, paper_id in request table
        // reviews: reviews from assignedReview table which mathces paper_id 
      })
    );

    res.status(200).json(papersWithAuthors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// // get conference paper details (with authors)
// router.get("/:conference_id/trial", async (req, res) => {
//   try {
//     const conference_id = req.params.conference_id;

//     // Fetch papers for the given conference_id
//     const { data: papers, error: papersError } = await db
//       .from('paper')
//       .select('*', )
//       .eq('conference_id', conference_id);

//     if (papersError) {
//       throw papersError;
//     }

//     // Fetch authors for each paper
//     const papersWithAuthors = await Promise.all(
//       papers.map(async (paper) => {
//         const { data: authors, error: authorsError } = await db
//           .from('paperAuthor')
//           .select('user_id')
//           .eq('paper_id', paper.paper_id);

//         if (authorsError) {
//           throw authorsError;
//         }

//         // Fetch full names of authors
//         const authorNames = await Promise.all(
//           authors.map(async (author) => {
//             const { data: user, error: userError } = await db
//               .from('user')
//               .select('*')
//               .eq('user_id', author.user_id)
//               .single();

//             if (userError) {
//               throw userError;
//             }

//             return `${user.first_name} ${user.last_name}`;
//           })
//         );

//         // Add author names to the paper
//         return {
//           ...paper,
//           authors: authorNames,
//         };
//       })
//     );

//     res.status(200).json(papersWithAuthors);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


// tell whether conference chair or not
// we have a conferenceChair( conference_id, user_id )

router.post("/chairOrNot", async (req, res) => {
  try {
    const { conference_id, user_id } = req.body;

    // Check whether this user exists in the conferenceChair table
    const { data: chairData, error: chairError } = await db
      .from('conferenceChair')
      .select('user_id')
      .eq('conference_id', conference_id)
      .single();

    // console.log(chairData);

    // if (chairError) {
    //   throw chairError;
    // }

    if (chairData.user_id == user_id) {
      // User is a conference chair
      res.status(200).json({ user_status: "chair" });
    } else {
      // User is not a conference chair
      res.status(200).json({ user_status: "user" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;

