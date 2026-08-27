const crypto = require("crypto");
const { MongoClient, ObjectId } = require("mongodb");
const { buildSeed } = require("./seed");

function newId() {
  return crypto.randomBytes(12).toString("hex");
}

function clone(doc) {
  return JSON.parse(JSON.stringify(doc));
}

function withIds(docs) {
  return docs.map((doc) => ({
    _id: newId(),
    ...doc,
  }));
}

class MemoryStore {
  constructor() {
    this.assignments = withIds(buildSeed());
  }

  async list() {
    return this.assignments.map(clone);
  }

  async get(id) {
    const found = this.assignments.find((item) => String(item._id) === String(id));
    return found ? clone(found) : null;
  }

  async insert(doc) {
    const created = { _id: newId(), ...doc };
    this.assignments.unshift(created);
    return clone(created);
  }

  async update(id, patch) {
    const index = this.assignments.findIndex((item) => String(item._id) === String(id));
    if (index === -1) return null;
    this.assignments[index] = { ...this.assignments[index], ...patch };
    return clone(this.assignments[index]);
  }

  async remove(id) {
    const before = this.assignments.length;
    this.assignments = this.assignments.filter((item) => String(item._id) !== String(id));
    return this.assignments.length < before;
  }

  async reset() {
    this.assignments = withIds(buildSeed());
    return this.assignments.length;
  }
}

class MongoStore {
  constructor(collection) {
    this.collection = collection;
  }

  async list() {
    return this.collection.find({}).sort({ createdAt: -1 }).toArray();
  }

  async get(id) {
    if (!ObjectId.isValid(id)) return null;
    return this.collection.findOne({ _id: new ObjectId(id) });
  }

  async insert(doc) {
    const result = await this.collection.insertOne(doc);
    return { ...doc, _id: result.insertedId };
  }

  async update(id, patch) {
    if (!ObjectId.isValid(id)) return null;
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: patch },
      { returnDocument: "after" }
    );
    return result && result.value ? result.value : await this.get(id);
  }

  async remove(id) {
    if (!ObjectId.isValid(id)) return false;
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async reset() {
    await this.collection.deleteMany({});
    const docs = buildSeed();
    if (docs.length) await this.collection.insertMany(docs);
    return docs.length;
  }
}

async function createStore() {
  const uri = (process.env.MONGO_URI || "").trim();
  if (!uri) {
    console.log("No MONGO_URI set — using in-memory demo store.");
    return { store: new MemoryStore(), mode: "memory" };
  }

  const client = await MongoClient.connect(uri);
  const dbName = process.env.DB_NAME || "examdb";
  const db = client.db(dbName);
  const collection = db.collection("assignments");
  const count = await collection.countDocuments();
  if (count === 0) {
    const docs = buildSeed();
    await collection.insertMany(docs);
    console.log(`Seeded ${docs.length} demo assignments into MongoDB.`);
  }
  console.log("MongoDB connected.");
  return { store: new MongoStore(collection), mode: "mongo", client };
}

module.exports = { createStore };
