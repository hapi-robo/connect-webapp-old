const router = require("express").Router();
const bcrypt = require("bcryptjs");

const User = require('../models/User');
const setLocale = require("../modules/locale");

// register page
// @TODO: Temporary until security checks are in place
router.get('/', setLocale, (req, res) => 
  res.send("Talk to the admin")
);

// router.get('/', setLocale, (req, res) => 
//   res.render('register', { 
//     title: `| ${req.polyglot.t("register.title")}`,
//     layout: './layouts/index',
//     polyglot: req.polyglot,
//     route: "/register"
//   })
// );

// register handle
router.post('/', (req, res) => {
  const { firstName, lastName, email, password, password2 } = req.body;
  let errors = [];

  // check required fields
  if (!firstName || !lastName || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  // check passwords match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  // check password length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }

  // show errors
  if (errors.length > 0) {
    res.render('register', {
      errors,
      firstName,
      lastName,
      email,
      password,
      password2,
      polyglot 
    });
  } else {
    // validation passed 
    User.findOne({ email: email })
      .then(user => {
        if (user) {
          errors.push({ msg: "Email is already registered"})
          // user exists
          res.render('register', {
            errors,
            firstName,
            lastName,
            email,
            password,
            password2,
            polyglot
          });
        } else {
          const newUser = new User({
            lastName: lastName,
            firstName: firstName,
            email: email,
            locale: polyglot.locale()
          });

          // hash password
          bcrypt.genSalt(10, (err, salt) => 
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              // set password to hashed password
              newUser.password = hash;
              newUser.save()
                .then(user => res.redirect('/users/login'))
                .catch(err => console.log(err));
          }));
        }
      });
  }
});

module.exports = router;
