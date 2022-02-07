const express = require('express');
const { sequelize, Users } = require('../models');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { idJoi, tagJoi } = require('../joi.js');
const tag = require('../models/tag');
const route = express.Router();
route.use(express.json());
route.use(express.urlencoded({ extended: true }));

function authToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (token == null) return res.status(401).json({ msg: err });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ msg: err });
        req.user = user;
        next();
    });
}

route.use(authToken);

route.get('/tag', (req, res) => {
    
    Users.findOne({ where: { id: req.user.userId } })
        .then( usr => {
            Tag.findAll({include: ['post']})
                .then( rows => res.json(rows) )
                .catch( err => res.status(500).json(err) );
        })
        .catch( err => res.status(500).json(err) );
});

route.get('/tag/:id', (req, res) => {
    
    Users.findOne({ where: { id: req.user.userId } })
        .then( usr => {
            const result = idJoi.validate(req.params);
            if(result.error){
                res.status(422).json({ msg: 'Greška u validaciji: ' + result.error.message });
            } else {
                Tag.findOne({ where: { id: req.params.id },include:['post'] })
                    .then( rows => res.json(rows) )
                    .catch( err => res.status(500).json(err) ); 
            }
        })
        .catch( err => res.status(500).json(err) );
});

route.post('/tag', (req, res) => {
    
    Users.findOne({ where: { id: req.user.userId } })
        .then( usr => {
            if (usr.admin) {
                const result = userSchema.validate(req.body);
                if(result.error){
                    res.status(422).json({ msg: 'Greška u validaciji: ' + result.error.message });
                } else {
                    Tag.create({ 
                        body: req.body.body
                    })
                        .then( rows => res.json(rows) )
                        .catch( err => res.status(500).json(err) );
                }  
            } else {
                res.status(403).json({ msg: "Nemate pravo na ovu akciju."});
            }
        })
        .catch( err => res.status(500).json(err) );
});

route.put('/tag/:id', (req, res) => {
    
    Users.findOne({ where: { id: req.user.userId } })
        .then( usr => {
            if (usr.admin) {
                const idResult = idJoi.validate(req.params);
                const result = tagJoi.validate(req.body);

                if(result.error){
                    res.status(422).json({ msg: 'Greška u validaciji: ' + result.error.message});
                } else if(idResult.error){
                    res.status(422).json({ msg: 'Greška u validaciji: ' + idResult.error.message});
                } else {
                    Tag.findOne({ where: { id: req.params.id },include:['post'] })
                    .then( tag => {
                        tag.body =  req.body.body;
                        tag.save()
                            .then( rows => res.json(rows) )
                            .catch( err => res.status(500).json(err) );
                    })
                    .catch( err => res.status(500).json(err) );
                }
            } else {
                res.status(403).json({ msg: "Nemate pravo na ovu akciju."});
            }
        })
        .catch( err => res.status(500).json(err) );
});

route.delete('/tag/:id', (req, res) => {
    
    Users.findOne({ where: { id: req.user.userId } })
        .then( usr => {
            if (usr.admin || usr.moderator) {
                const result = idJoi.validate(req.params);
                if(result.error){
                    res.status(422).json({ msg: 'Greška u validaciji: ' + result.error.message });
                } else {
                    Tag.findOne({ where: { id: req.params.id },include:['post'] })
                    .then( usr => {
                        usr.destroy()
                            .then( rows => res.json(rows) )
                            .catch( err => res.status(500).json(err) );
                    })
                    .catch( err => res.status(500).json(err) );
                }
            } else {
                res.status(403).json({ msg: "Nemate pravo na ovu akciju."});
            }
        })
        .catch( err => res.status(500).json(err) );
});

module.exports = route;