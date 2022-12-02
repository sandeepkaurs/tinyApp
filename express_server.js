// assisted by fellow colleague in order to apply following technigue to generate string
const generateRandomString = () => {
  return ((Math.random() + 1)* 0x10000).toString(36).substring(6);
}

const express = require("express");
const app = express();
const cookieParser = require("cookie-parser")
app.use(cookieParser())
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "1234",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: "1234",
  },
};
 // getUserByEmail
const getUserByEmail = (email) => {
  for (const userID in users) {
    // console.log(userID);
    // console.log(users[userID]);
    const user = users[userID];
    //console.log(user);
    if (email === user.email) {
      return user;
    }
  }
  return null;
};

console.log(getUserByEmail("c@c.com"));

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.post("/urls", (req, res) => {
  console.log(req.body.longURL); // Log the POST request body to the console
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

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
  const templateVars = {
    user: users[req.cookies.user_id], 
    urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = { 
    id: req.params.id, 
    longURL:urlDatabase[req.params.id], 
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = { 
    id: req.params.id, 
    longURL:urlDatabase[req.params.id], 
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// to delete url resource and redirect back to index(urls)
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("urlDatabase", urlDatabase);
  console.log("shortURL", req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  
});

app.post("/urls/:id", (req, res) => {
  console.log("body", req.body);
  console.log("id", req.params.id);
  const longURL = req.body.NewURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = longURL;
  console.log("urlDatabase", urlDatabase);
    res.redirect("/urls");
})
// register-get
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id], 
  }
  res.render("urls_register", templateVars);
})
// register-post
app.post("/register",(req, res) => {
  console.log(req.body);
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  console.log(users);
  if (!email || !password) {
    return res.status(400).send("Please provide email & password");
  } 
  const user = getUserByEmail(email)
  console.log("returned user", user);
  if (getUserByEmail(req.body.email)) {
    return res.status(400).send("Email already exists");
  }
  const newUser = {
    id: userID,
    email: email,
    password: password
  };
  users[userID] = newUser;
  console.log(users);
  res.cookie("user_id", userID);
  res.redirect("/urls")
})

// login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id], 
  }
  res.render("urls_login", templateVars);
})
// login
app.post("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id], 
  }
  const user = getUserByEmail(req.body.email, users);
  const password = req.body.password;
  // f a user with that e-mail cannot be found, return a response with a 403 status code
  if(!user) {
    return res.status(403).send("User not found");
  }
  // If a user with that e-mail address is located, compare the password given in the form with the existing user's password. If it does not match, return a response with a 403 status code.
  if (user && user.password !== password) {
    return res.status(403).send("Password doesn't match") 
  }
  const user_id = user.id
  // If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /urls.
  res.cookie("user_id", user_id);
  res.redirect("/urls");
})
// logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/login');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});