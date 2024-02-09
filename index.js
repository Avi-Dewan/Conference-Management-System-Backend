const express = require('express');
const { log } = require('console');
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;




app.use(express.json());
app.use(cookieParser());
app.use(cors( {
  credentials: true,
  origin: ["http://localhost:5173"]
}));


const trailRouter = require("./router/trial");
const conferenceRouter = require("./router/conference");
const userRouter = require("./router/user");
const paperRouter = require("./router/paper");
const assignRouter = require("./router/assign");
const authRouter = require("./router/auth");
const reviewerRouter = require("./router/reviewer");
const requestRouter = require("./router/request");
const workshopRouter = require("./router/workshop");
const notificationRouter = require("./router/notification");
const mailRouter = require("./router/mail");const authorRouter = require("./router/author");


app.use("/trial", trailRouter);
app.use("/conference", conferenceRouter);
app.use("/user", userRouter);
app.use("/paper",paperRouter);
app.use("/assign", assignRouter);
app.use("/auth", authRouter);
app.use("/reviewer", reviewerRouter);
app.use("/request", requestRouter);
app.use("/workshop", workshopRouter);
app.use("/notification", notificationRouter);
app.use("/mail", mailRouter);
app.use("/author",authorRouter);



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
