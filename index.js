const express = require('express');
const { log } = require('console');
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;




app.use(express.json());
app.use(cors());


const trailRouter = require("./router/trial");
const conferenceRouter = require("./router/conference");
const userRouter = require("./router/user");
const paperRouter = require("./router/paper");
const assignRouter = require("./router/assign");
const authRouter = require("./router/auth");
const requestRouter = require("./router/request");


app.use("/trial", trailRouter);
app.use("/conference", conferenceRouter);
app.use("/user", userRouter);
app.use("/paper",paperRouter);
app.use("/assign", assignRouter);
app.use("/auth", authRouter);
app.use("/request", requestRouter);



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
