# Project Setup

## 1. Prerequisites

* Node.js and npm (or yarn) installed.  Verify with `node -v` and `npm -v`.
* MongoDB installed and running.  Verify by connecting to the MongoDB shell.


## 2. Project Initialization

bash
mkdir my-web-app
cd my-web-app
npm init -y
git init
## 3. Install Packages

bash
npm install express ejs bootstrap mongoose body-parser
## 4. Project Structure

my-web-app/
├── package.json
├── server.js  (or app.js)
├── views/
│   └── index.ejs
├── public/
│   └── stylesheets/
│       └── style.css  (or bootstrap files)
└── models/
    └── yourModel.js

## 5. Server.js (Example)

const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Failed to connect to MongoDB:", err));


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));


// Define routes here...


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
## 6.  YourModel.js (Example)

const mongoose = require('mongoose');

const yourSchema = new mongoose.Schema({
  //Your schema definition here
});

module.exports = mongoose.model('YourModel', yourSchema);

## 7. index.ejs (Example)

<!DOCTYPE html>
<html>
<head>
  <title>My Web App</title>
  <link rel="stylesheet" href="/stylesheets/style.css">
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
## 8.  .gitignore (Example)

node_modules/
.env