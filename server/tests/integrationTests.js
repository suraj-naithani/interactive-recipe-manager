const request = require('supertest');
const app = require('../app'); // Path to your app.js or equivalent
const { MongoClient } = require('mongodb');
const assert = require('assert');

const MONGO_URI = 'mongodb://localhost:27017/your_database_name'; // Replace with your MongoDB connection string

describe('Integration Tests', () => {
  let db, connection;

  before(async () => {
    connection = await MongoClient.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    db = connection.db();
    // Ensure a clean database state before each test run.  Consider truncating collections instead of dropping for better performance if the database gets large.
    await db.collection('your_collection_name').deleteMany({}); // Replace with your collection name

    //Seed database with necessary data if needed.
  });

  after(async () => {
    await connection.close();
  });


  it('should create a new item and retrieve it', async () => {
    const newItem = { name: 'Test Item', description: 'Test Description' };
    const res = await request(app)
      .post('/api/items')
      .send(newItem)
      .expect(201); // Expecting 201 Created status code

    assert.ok(res.body._id); //Check if _id was returned
    const retrievedItem = await db.collection('your_collection_name').findOne({_id: res.body._id});
    assert.deepStrictEqual(retrievedItem, {...newItem, _id: res.body._id});


    const getRes = await request(app)
      .get(`/api/items/${res.body._id}`)
      .expect(200);
    assert.deepStrictEqual(getRes.body, {...newItem, _id: res.body._id});

  });

  it('should handle errors gracefully', async () => {
    await request(app)
      .post('/api/items')
      .send({})
      .expect(400); // Expecting 400 Bad Request for missing data

    await request(app)
      .get('/api/items/invalidId')
      .expect(404); // Expecting 404 Not Found for invalid ID

  });

  // Add more integration tests as needed to cover other API endpoints and functionalities.  Remember to test edge cases and error handling.  Consider using a test runner such as Mocha or Jest for better organization.
  it('should render the homepage', async () => {
    await request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/)
        .then(res => {
            assert.ok(res.text.includes("<h1>Welcome</h1>")) // Or other relevant assertion based on your homepage content.
        });

  });
});