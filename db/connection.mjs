import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

// save connection
const connectionStr = process.env.mongoURI;

// create new connection
const client = new MongoClient(connectionStr);

// assign null var for connection
let conn;

// give value to connection var in try catch block
// connect and log the db with await
try {
  conn = await client.connect();
  console.log("Connect to DB!");
} catch (err) {
  console.error(err);
}

let db = conn.db("sample_training");

export default db;
