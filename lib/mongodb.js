import { MongoClient } from 'mongodb';

// .env.local dan ulanish kodini olamiz
const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!uri) {
  throw new Error('Iltimos, .env.local fayliga MONGODB_URI ni qo\'shing!');
}

if (process.env.NODE_ENV === 'development') {
  // Development rejimida ulanishni saqlab qolish (qayta ulanmaslik uchun)
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Production rejimida
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;