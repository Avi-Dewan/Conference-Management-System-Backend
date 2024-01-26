const express = require('express');
const { log } = require('console');
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cors());


const trailRouter = require("./router/trial");
const conferenceRouter = require("./router/conference")

app.use("/trial", trailRouter);
app.use("/conference", conferenceRouter);




app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
