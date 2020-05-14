'use strict';

const app = require('../backend/lib/server.js').server;
const supergoose = require('@code-fellows/supergoose');
const mockRequest = supergoose(app);
const faker = require('faker');
const mongoose = require('mongoose');

let rental1data = null;
let rental2data = null;
let owner = null;
let borrower = null;
let item1data = null;
let item2data = null;
let ownerData = null;
let borrowerData = null;
let item1 = null;
let item2 = null;
let rental1 = null;

describe('rental routes', () => {

  beforeAll( async () => {
    
    ownerData = {
      userName: faker.name.findName(),
      password: faker.internet.password(),
      email: faker.internet.email(),
      address: faker.address.streetAddress(),
    };

    borrowerData = {
      userName: faker.name.findName(),
      password: faker.internet.password(),
      email: faker.internet.email(),
      address: faker.address.streetAddress(),
    };

    owner = await mockRequest.post('/user').send(ownerData);
    borrower = await mockRequest.post('/user').send(ownerData);

    item1data = {
      _owner: owner.body._id,
      item: faker.commerce.productName(),
      type: faker.commerce.productAdjective(),
      subCategory: faker.commerce.productMaterial(),
      description: `This is a ${faker.company.bsBuzz()} ${faker.company.bsAdjective()} ${faker.company.bsNoun()}.`,
    };

    item2data = {
      _owner: owner.body._id,
      item: faker.commerce.productName(),
      type: faker.commerce.productAdjective(),
      subCategory: faker.commerce.productMaterial(),
      description: `This is a ${faker.company.bsBuzz()} ${faker.company.bsAdjective()} ${faker.company.bsNoun()}.`,
    };

    let item1 = await mockRequest.post('/item').send(item1data);
    let item2 = await mockRequest.post('/item').send(item2data);

    rental1data = {
      _owner: mongoose.Types.ObjectId(owner.body._id),
      _borrower: mongoose.Types.ObjectId(borrower.body._id),
      _item: mongoose.Types.ObjectId(item1.body._id),
    };

    rental2data = {
      _owner: mongoose.Types.ObjectId(owner.body._id),
      _borrower: mongoose.Types.ObjectId(borrower.body._id),
      _item: mongoose.Types.ObjectId(item2.body._id),
    };

  });


  it('can create new rental requests', async() => {
    // const realDateNow = Date.now.bind(global.Date);
    const dateNowStub = jest.fn(() => 1589331600000); //Wednesday, May 13, 2020 1:00:00 AM
    global.Date.now = dateNowStub;

    rental1 = await mockRequest.post('/rentaldoc').send(rental1data);
    // console.log('***', rental1.body);
    expect(rental1.body.currentStatus).toEqual('1-borrowRequest');
    expect(typeof rental1.body._owner).toEqual('string');
    expect(typeof rental1.body._borrower).toEqual('string');
    expect(typeof rental1.body._item).toEqual('string');
    expect(rental1.body.initiatedDate).toEqual('2020-05-13T01:00:00.000Z');
    expect(rental1.body.lastUpdate).toEqual('2020-05-13T01:00:00.000Z');
  });

  it('can update a rental request incrementaly', async() => {
    const dateNowStub = jest.fn(() => 1589335200000); //2020-05-13T02:00:00.000Z
    global.Date.now = dateNowStub;
    // console.log('MY ID', rental1.body._id);
    let updatedRental = await mockRequest.put(`/rentaldoc/${rental1.body._id}`);
    console.log('***rentalFinal', updatedRental.body);
  });

});
