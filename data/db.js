// data/db.js - MongoDB Atlas pour la persistance des données
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
let client;
let db;

async function connect() {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db('yoshibot');
  console.log('[DB] Connecté à MongoDB Atlas');
  return db;
}

// ── Yoshis ──────────────────────────────────────────────────────────────
async function getYoshi(userId) {
  const database = await connect();
  return await database.collection('yoshis').findOne({ userId });
}

async function setYoshi(userId, yoshiData) {
  const database = await connect();
  await database.collection('yoshis').updateOne(
    { userId },
    { $set: { ...yoshiData, userId } },
    { upsert: true }
  );
}

async function getAllYoshis() {
  const database = await connect();
  const docs = await database.collection('yoshis').find({}).toArray();
  const result = {};
  docs.forEach(d => { result[d.userId] = d; });
  return result;
}

// ── Giveaways ───────────────────────────────────────────────────────────
async function getGiveaways() {
  const database = await connect();
  return await database.collection('giveaways').find({}).toArray();
}

async function saveGiveaways(giveaways) {
  const database = await connect();
  await database.collection('giveaways').deleteMany({});
  if (giveaways.length > 0) {
    await database.collection('giveaways').insertMany(giveaways);
  }
}

// ── Couples ─────────────────────────────────────────────────────────────
async function getCouples() {
  const database = await connect();
  const docs = await database.collection('couples').find({}).toArray();
  const result = {};
  docs.forEach(d => { result[d.key] = d; });
  return result;
}

async function saveCouples(couples) {
  const database = await connect();
  await database.collection('couples').deleteMany({});
  const docs = Object.entries(couples).map(([key, val]) => ({ key, ...val }));
  if (docs.length > 0) await database.collection('couples').insertMany(docs);
}

// ── Warns ───────────────────────────────────────────────────────────────
async function getWarns(userId) {
  const database = await connect();
  const doc = await database.collection('warns').findOne({ userId });
  return doc ? doc.warns : [];
}

async function saveWarns(userId, warns) {
  const database = await connect();
  await database.collection('warns').updateOne(
    { userId },
    { $set: { userId, warns } },
    { upsert: true }
  );
}

async function getAllWarns() {
  const database = await connect();
  const docs = await database.collection('warns').find({}).toArray();
  const result = {};
  docs.forEach(d => { result[d.userId] = d.warns; });
  return result;
}

module.exports = {
  connect,
  getYoshi, setYoshi, getAllYoshis,
  getGiveaways, saveGiveaways,
  getCouples, saveCouples,
  getWarns, saveWarns, getAllWarns,
};
