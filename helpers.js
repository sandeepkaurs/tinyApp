
const generateRandomString = () => {
  return ((Math.random() + 1) * 0x10000).toString(36).substring(6);
}

const getUserByEmail = (email, users) => {
  for (const userID in users) {
    const user = users[userID];
    if (email === user.email) {
      return user;
    }
  }
  return null;
};

const urlsForUser = function (id, urlDatabase) {
  const userUrls = {};
  for (let urlShort in urlDatabase) {
    if (urlDatabase[urlShort].userID === id) {
      userUrls[urlShort] = urlDatabase[urlShort];
    }
  }
  return userUrls;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser }