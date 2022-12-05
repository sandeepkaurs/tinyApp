const express = require("express");
const morgan = require("morgan");
const bcrypt = require("bcryptjs")
const app = express();

const cookieSession = require('cookie-session');
const helpers = require("./helpers");
const getUserByEmail = helpers.getUserByEmail;
const generateRandomString = helpers.generateRandomString;
const urlsForUser = helpers.urlsForUser;

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"))
app.use(cookieSession({
  name: 'whatever',
  keys: ["blahblahblah"]
}))

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "$2a$10$7I0pOQOGkOMniilZEJ9x1uREH2.Go2B31JoxO/SvAuFTf9lI.eWFG",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: "$2a$10$7I0pOQOGkOMniilZEJ9x1uREH2.Go2B31JoxO/SvAuFTf9lI.eWFG",
  },
};
// assisted by fellow colleague in order to apply following technigue to generate string
// const generateRandomString = () => {
//   return ((Math.random() + 1) * 0x10000).toString(36).substring(6);
// }
// getUserByEmail
// const getUserByEmail = (email, users) => {
//   for (const userID in users) {
//     const user = users[userID];
//     if (email === user.email) {
//       return user;
//     }
//   }
//   return null;
// };

// const urlsForUser = function (id) {
//   const userUrls = {};
//   for (let urlShort in urlDatabase) {
//     if (urlDatabase[urlShort].userID === id) {
//       userUrls[urlShort] = urlDatabase[urlShort];
//     }
//   }
//   return userUrls;
// };


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(400).send("Please login to view URLs");
  }
  const userUrl = urlsForUser(user_id, urlDatabase);
  const templateVars = {
    user: users[user_id],
    urls: userUrl
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body.longURL); // Log the POST request body to the console
  const userID = req.session.user_id;
  let longURL = req.body.longURL;
  const shortURL = generateRandomString();
  if (!longURL.includes("http")) {
    longURL = `http://${longURL}`
  };
  urlDatabase[shortURL] = { longURL, userID };
  console.log("url database check", urlDatabase);
  res.redirect(`/urls/${shortURL}`);
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(400).send(`<h1>You must login first!<h1> <a href ="/login">Back to Login</a>`);
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});
// ask about this

app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  // checking if user is logged in 
  if (!user_id) {
    return res.status(400).send(`<h1>Please log in<h1> <a href ="/login">Back to Login</a>`);
  }
  // checking if short id is in url database
  const user = users[user_id];
  const shortCodeUrl = req.params.id;
  if (!urlDatabase[shortCodeUrl]) {
    return res.status(400).send(`<h1>URL doesn't exist<h1> <a href ="/urls">Back to Main Page</a>`);
  }
  // checking is user id matches logged in user
  if (user_id !== urlDatabase[shortCodeUrl].userID) {
    return res.status(400).send(`<h1>URL doesn't belong to this user<h1> <a href ="/urls">Back to Main Page</a>`);
  }
  const templateVars = {
    id: shortCodeUrl,
    longURL: urlDatabase[req.params.id].longURL,
    user: user
  };
  res.render("urls_show", templateVars);
});
//if (user_id !== urlDatabase[req.params.id].userID)

app.post("/urls/:id", (req, res) => {
  console.log("body", req.body);
  console.log("id", req.params.id);
  const longURL = req.body.NewURL;
  const shortURL = req.params.id;
  if (!req.session.user_id) {
    return res.status(400).send(`<h1>Please log in<h1> <a href ="/login">Back to Login</a>`);
  }
  if (!urlDatabase[shortURL]) {
    return res.status(400).send(`<h1>URL doesn't exist<h1> <a href ="/urls">Back to Main Page</a>`);
  }
  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    return res.status(400).send(`<h1>URL doesn't belong to this user<h1> <a href ="/urls">Back to Main Page</a>`);
  }
  urlDatabase[shortURL].longURL = longURL;
  console.log("urlDatabase", urlDatabase);
  res.redirect("/urls");
})

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// to delete url resource and redirect back to index(urls)
app.post("/urls/:id/delete", (req, res) => {
  console.log("urlDatabase", urlDatabase);
  if (!req.session.user_id) {
    return res.status(400).send(`<h1>Please log in<h1> <a href ="/login">Back to Login</a>`);
  }
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send(`<h1>URL doesn't exist<h1> <a href ="/urls">Back to Main Page</a>`);
  }
  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    return res.status(400).send(`<h1>URL doesn't belong to this user<h1> <a href ="/urls">Back to Main Page</a>`);
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");

});

// register-get
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  }
  res.render("urls_register", templateVars);
})
// register-post
app.post("/register", (req, res) => {
  console.log(req.body);
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  console.log(users);
  if (!email || !password) {
    return res.status(400).send("Please provide email & password");
  }
  const user = getUserByEmail(email, users)
  console.log("returned user", user);
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send("Email already exists");
  }
  const newUser = {
    id: userID,
    email: email,
    password: bcrypt.hashSync(password, 10)
  };
  users[userID] = newUser;
  console.log(users);
  req.session.user_id = userID;
  res.redirect("/urls")
})

// login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  }
  res.render("urls_login", templateVars);
})
// login
app.post("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  }
  const user = getUserByEmail(req.body.email, users);
  const password = req.body.password;
  // f a user with that e-mail cannot be found, return a response with a 403 status code
  if (!user) {
    return res.status(403).send("User not found");
  }
  // If a user with that e-mail address is located, compare the password given in the form with the existing user's password. If it does not match, return a response with a 403 status code.
  if (user && !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Password doesn't match")
  }
  const user_id = user.id
  // If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /urls.
  req.session.user_id = user_id;
  res.redirect("/urls");
})
// logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

