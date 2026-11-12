const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");

const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});
afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
});

describe("Test d'intégration Node ↔ Flask", () => {
  test("Réponse correcte de l'API Flask", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "Bonjour" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("response");
    expect(typeof res.body.response).toBe("string");
  }, 15000); // ← 15 secondes pour laisser le temps à Flask de répondre
});
