const express = require("express");
const app = express();

const userRoutes = require("./routes/users");
app.use(userRoutes);


app.set("view engine","ejs");



app.listen(3000, () => {
    console.log("listening on port 3000");

});