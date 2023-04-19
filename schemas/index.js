const mongoose = require("mongoose");

const connect = () => {
  mongoose
    .connect("mongodb://127.0.0.1:27017/postNcomment")
    .catch((err) => console.log(err));
};

mongoose.connection.on("error", (err) => {
  console.error("mongo connection error", err);
});

module.exports = connect;
