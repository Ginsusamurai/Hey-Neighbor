/* eslint-disable new-cap */
'use strict';

const express = require('express');
const rentalRoutes = express.Router();

const rentalSchema = require('../schemas/rental-schema.js');
const Model = require('../schemas/model.js');
const itemSchema = require('../schemas/item-schema.js');
const giveMeAStory = require('../lib/giveMeAStory.js');
const bearerAuth = require('../auth/bearer-auth.js');


rentalRoutes.get('/rentaldoc', bearerAuth, getRentalDocs);
rentalRoutes.get('/rentaldoc/:_id', bearerAuth, getRentalDocs);
rentalRoutes.post('/rentaldoc', bearerAuth, createRentalDoc);
rentalRoutes.put('/rentaldoc/:_id', bearerAuth, incrementRentalProcess);
rentalRoutes.delete('/rentaldoc/:_id', bearerAuth, deactivateRentalDoc);
rentalRoutes.get('/rentaldoc_pretty', bearerAuth, getPrettyRecords);
rentalRoutes.get('/myLentItems/:_id', bearerAuth, myLentItems)
rentalRoutes.get('/myBorrowedItems/:_id', bearerAuth, borrowingItems);

async function myLentItems(req,res){
  try{
    let records = await rentalSchema.find({_owner:req.params._id})
      .populate('_owner','userName')
      .populate('_borrower', 'userName')
      .populate('_item', 'item');
      let recordsSummary = [];
      records.forEach(rentalDoc => {
        console.log('rentaldoc', rentalDoc._owner);
        let obj = {};
        obj._id = rentalDoc._id;
        obj.owner = rentalDoc._owner.userName;
        obj.owner_id = rentalDoc._owner._id;
        obj.borrower = rentalDoc._borrower.userName;
        obj.borrower_id = rentalDoc._borrower._id;
        obj.item = rentalDoc._item.item;
        obj.currentStatus = rentalDoc.currentStatus;
        obj.archived = rentalDoc.archived;
        obj.openRental = rentalDoc.openRental;
        obj.lastUpdate = rentalDoc.lastUpdate;
        obj.initiatedDate = rentalDoc.initiatedDate;
        console.log(obj);
        recordsSummary.push(obj);
      });
  
      let prettyResponse = giveMeAStory(recordsSummary);
      console.log('myLentItems', prettyResponse);
      res.status(200).json(prettyResponse);
    }catch(e){
      res.status(400).json(e);
    }
}

async function borrowingItems(req,res){
  try{
    let records = await rentalSchema.find({_borrower:req.params._id})
      .populate('_owner','userName')
      .populate('_borrower', 'userName')
      .populate('_item', 'item');
      let recordsSummary = [];
      records.forEach(rentalDoc => {
        console.log('rentaldoc', rentalDoc._owner);
        let obj = {};
        obj._id = rentalDoc._id;
        obj.owner = rentalDoc._owner.userName;
        obj.owner_id = rentalDoc._owner._id;
        obj.borrower = rentalDoc._borrower.userName;
        obj.borrower_id = rentalDoc._borrower._id;
        obj.item = rentalDoc._item.item;
        obj.currentStatus = rentalDoc.currentStatus;
        obj.archived = rentalDoc.archived;
        obj.openRental = rentalDoc.openRental;
        obj.lastUpdate = rentalDoc.lastUpdate;
        obj.initiatedDate = rentalDoc.initiatedDate;
        console.log(obj);
        recordsSummary.push(obj);
      });
  
      let prettyResponse = giveMeAStory(recordsSummary);
  
      res.status(200).json(prettyResponse);
    }catch(e){
      res.status(400).json(e);
    }
}


async function getPrettyRecords(req,res){
  // let rentalModel = new Model(rentalSchema);
  try{
    let records = await rentalSchema.find()
      .populate('_owner','userName')
      .populate('_borrower', 'userName')
      .populate('_item', 'item');
    console.log('records', records);

    let recordsSummary = [];
    console.log(records.length);
    records.forEach(rentalDoc => {
      console.log('rentaldoc', rentalDoc._owner);
      let obj = {};
      obj._id = rentalDoc._id;
      obj.owner = rentalDoc._owner.userName;
      obj.owner_id = rentalDoc._owner._id;
      obj.borrower = rentalDoc._borrower.userName;
      obj.borrower_id = rentalDoc._borrower._id;
      obj.item = rentalDoc._item.item;
      obj.currentStatus = rentalDoc.currentStatus;
      obj.archived = rentalDoc.archived;
      obj.openRental = rentalDoc.openRental;
      obj.lastUpdate = rentalDoc.lastUpdate;
      obj.initiatedDate = rentalDoc.initiatedDate;
      console.log(obj);
      recordsSummary.push(obj);
    });

    let prettyResponse = await giveMeAStory(recordsSummary);

    res.status(200).json(prettyResponse);
  }catch(e){
    res.status(400).json(e);
  }

}

// create a rental doc
async function createRentalDoc(req,res){
  try{
    let rentalModel = new Model(rentalSchema);
    let newRental = await rentalModel.create(req.body);
    res.status(201).json(newRental);
  }catch(e){
    res.status(401).json(e);
  }
}

// update a rental doc. this ONLY changes the 'last update' field,
// advances the 'currentStatus' through the steps.
// this is accomplished via pre-save hook and is hands-free
async function incrementRentalProcess(req,res){
  try{
    let rentalModel = new Model(rentalSchema);
    let updatedRental = await rentalModel.resave(req.params._id);
    let itemModel = new Model(itemSchema);
    // eslint-disable-next-line no-unused-vars
    let updatedItem;
    if(updatedRental.currentStatus.charAt(0) === '2'){
      updatedItem = await itemModel.update(
        {'_id':updatedRental._item,},
        {'_custodyId':updatedRental._borrower,},
        {new:true,});
    }else if(updatedRental.currentStatus.charAt(0) === '4'){
      updatedItem = await itemModel.update(
        {'_id':updatedRental._item,},
        {'_custodyId':updatedRental._owner,},
        {new:true,});
    }
    res.status(200).json(updatedRental);
  }catch(e){
    res.status(401).json(e);
  }
}

// return specific rental doc or all of them
async function getRentalDocs(req,res){
  let rentalModel = new Model(rentalSchema);
  try{
    const userList = await rentalModel.get(req.params._id);
    res.status(200).json(userList);
  }catch(e){
    res.status(401).json(e);
  }
}

// deactivate a rental doc
async function deactivateRentalDoc(req,res){
  let rentalModel = new Model(rentalSchema);
  let docCheck = await rentalModel.get(req.params._id);
  let invalidCancelStates = ['2','3'];
  if(invalidCancelStates.includes(docCheck[0].currentStatus.toString().charAt(0))){
    res.status(406).json(docCheck);
  }else{
    let docDeactivate = await rentalModel.update(req.params._id, {'archived':true, 'openRental':false}, {new:true,});
    res.status(200).json(docDeactivate);
  }

}

module.exports = rentalRoutes;
