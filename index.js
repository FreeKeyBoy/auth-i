const express = require('express');
const knex = require('knex');
const knexConfig = require('./knexfile');
const db = knex(knexConfig.development);
const server = express();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);

server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

const sessionConfig = {
    name: 'authIsession',
    secret: 'aweioh23489uj.awej8cvac-klsm',
    cookie: {
        maxAge: 1000 * 60 * 10,
        secure: false,
    },
    httpOnly: true,
    resave: false,
    saveUnitialized: false,
    store: new KnexSessionStore({
        tablename: 'sessions',
        sidfieldname: 'sid',
        knex: db,
        createtable: true,
        clearInterval: 1000 * 60 * 60
    })
  }

//endpoints  
//login
server.post('/login', (req,res) => {
    //get username & password from body
    const credentials = req.body;

    db('users')
        .where({ username: credentials.username })
        .first()
        .then(user => {
            if(user.length && bcrypt.compareSync(credentials.password, user[0].password))
                //bcryptjs needed for compareSync
                //passwords match user and user exists by that username
                { req.session.userId = user.id;
                  res.status(200).json({ message: 'It worked'})
              } else {
                //either username or password is valid, all returns failure
                res.status(401).json({ message: 'You messed up'})
              }
        })
        .catch(err => res.json(err))
})

//registration
server.post('/register', (req,res) => {
    //grab uname and upass
    const credentials = req.body;
    //hash pass
    const hash = bcrypt.hashSync(credentials.password, 10);
    credentials.password = hash;

    db('users')
        .insert(credentials)
        .then(ids => {
            db('users')
            .where({ id: ids[0]})
            .first()
            .then(user => {
                res.status(201).json(user);
            })
        })
        .catch(err => res.status(500).json(err))
})

server.get('/users', (req,res) => {
    db('users')
        .select('id', 'username', 'password')
        .then(users => {
            res.json(users);
        })
        .catch(err => res.send(err));
});

//RESTRICTED
function protected(req, res, next) {
    // restricts access to only authenticated users
    if (req.session && req.session.userId) {
      next();
    } else {
      //bounce them
      res.status(401).json({ message: 'not allowed'})
    }
  }
  
   server.get('/restricted', protected, (req, res) => {
    //if they are logged in, provide access to users
    db('users')
      .select('id', 'username', 'password') // added password to the select****
      .where({ id: req.session.user })
      .first()
      .then(users => {
        res.json(users);
      })
      .catch(err => res.send(err));
  });

const port = 7777;

server.listen(port, function() {
    console.log(`The Server Is Listening @ localhost:${port}`);
}) 