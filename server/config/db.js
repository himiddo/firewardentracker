const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

//for configuring the database
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE || 'FireWardenDB';
const containerId = process.env.COSMOS_CONTAINER || 'WardenEntries';
//creates a new cosmos client
const client = new CosmosClient({ endpoint, key });

let database;
let container;

async function initializeDatabase() {
  try {
    //create database if it doesn't exist
    const { database: db } = await client.databases.createIfNotExists({
      id: databaseId
    });
    database = db;
    console.log(`Database '${databaseId}' ready`);

    //create container if it doesn't exist
    const { container: cont } = await database.containers.createIfNotExists({
      id: containerId,
      partitionKey: { paths: ['/staff_number'] }
    });
    container = cont;
    console.log(`Container '${containerId}' ready`);

    return container;
  } catch (err) {
    console.error('Error initializing Cosmos DB:', err);
    throw err;
  }
}

function getContainer() {
  return container;
}

module.exports = {
  initializeDatabase,
  getContainer,
  client
};
