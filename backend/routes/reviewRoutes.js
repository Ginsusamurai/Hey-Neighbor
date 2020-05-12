'use strict';

const express = require('express');
const reviewRoutes = express.Router();
const reviewSchema = require('../schemas/review-schema.js');
const Model = require('../schemas/model.js');


// get all reviews and return to user
reviewRoutes.get('/review', async (req,res) => {
  let reviewModel = new Model(reviewSchema);
  let results = await reviewModel.find();
  res.status(200).json(results);
});

reviewRoutes.get('/review/:id', async (req,res) =>{
  let reviewModel = new Model(reviewSchema);
  let results = await reviewModel.get(req.params.id);
  res.status(200).json(results);
});

// this will find the review based on the subject and type of review
// rather than by finding by the review ID
reviewRoutes.get('/review/:subject_id/:type', async(req,res) => {
  let reviewModel = new Model(reviewSchema);
  let query = {reviewSubjet: req.params.subject_id, reviewType: req.params.type};
  let results = await reviewModel.find(query);
  res.status(200).json(results);
});

reviewRoutes.post('/review', async (req,res) =>{
  let reviewModel = new Model(reviewSchema);
  reviewModel.create(req.body)
    .then( results => {
      res.status(201).json(results);
    })
    .catch(e => {
      console.log('malformed review post request');
      res.status(400).json(e);
    });
});

reviewRoutes.put('/review/:id', async (req,res) => {
  let reviewModel = new Model(reviewSchema);
  reviewModel.update(req.body)
    .then(results => {
      res.status(201).json(results);
    })
    .catch(e =>{
      console.log('malformed review put request');
      res.status(400).json(e);
    });
});

reviewRoutes.delete('/review/:id', async (req,res) => {
  let reviewModel = new Model(reviewSchema);
  reviewModel.delete(req.params.id)
    .then()
});



module.exports = reviewRoutes;