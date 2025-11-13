import { MongoClient, Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required")
}

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || "ledgermind"

let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  const client = new MongoClient(uri)
  clientPromise = client.connect()
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise
  return client.db(dbName)
}

export default clientPromise
