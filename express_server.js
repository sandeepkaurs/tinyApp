const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

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
  const templateVars = {username: req.cookies["username"], urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = req.cookies.username;
  const templateVars = { id: req.params.id, longURL:urlDatabase[req.params.id], username : username};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const username = req.cookies.username;
  const templateVars = { id: req.params.id, longURL:urlDatabase[req.params.id], username : username};
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

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
})
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});