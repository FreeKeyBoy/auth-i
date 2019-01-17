const express = require('express');
const knex = require('knex');
const knexConfig = require('./knexfile');
const db = knex(knexConfig.development);
const server = express();
const bcrypt = require('bcryptjs');

server.use(express.json());

//login
server.post('/login', (req,res) => {
    //get username & password from body
    const credentials = req.body;

    db('users')
        .where({ username: credentials.username })
        .first()
        .then(user => {
            if(user && bcrypt.compareSync(credentials.password, user.password))
                //bcryptjs needed for compareSync
                //passwords match user and user exists by that username
                { res.status(200).json({ message: 'It worked'})
              } else {
                //either username or password is valid, all returns failure
                res.status(401).json({ message: 'You messed up'})
              }
        })
        .catch(err => res.json(err))
})

//registration
server.post('/register', (req,res) => {
    //grab uname and pass
    const credentials = req.body;
  
    //hash the pass
    const hash = bcrypt.hashSync(credentials.password, 4);
  
    credentials.password = hash;
  
    db('users')
        .insert(credentials)
        .then(ids => {
        res.status(201).json(ids);
      })
        .catch(err => res.status(500).json(err))
    })
  
    server.get('/users', (req, res) => {
        db('users')
            .select('id', 'username', 'password') // ***** added password to the select
            .then(users => {
            res.json(users);
        })
        .catch(err => res.send(err));
});

const port = 7777;

server.listen(port, function() {
    console.log(`The Server Is Listening @ localhost:${port}`);
}) 