require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("./database");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/users", userRoutes);

// Vercel requires the api to be exported
module.exports = app;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
