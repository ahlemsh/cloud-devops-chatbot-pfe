const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const Message = require("../../models/message");

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

describe("Chat API", () => {
  test("Doit répondre avec un message généré", async () => {
    const response = await request(app)
      .post("/api/chat")
      .send({ message: "Bonjour" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("response"); 
  });
});

describe("Sessions API", () => {
  let sessionId;

beforeAll(async () => {
  const response = await request(app).post("/api/chat").send({ message: "Test session" });

  console.log("Réponse après création de session:", response.body); // Debugging

  sessionId = response.body.sessionId;

  console.log("Session ID utilisé pour le test:", sessionId); // Debugging
});
  // Tester la récupération de toutes les sessions
  test("Doit récupérer toutes les sessions", async () => {
    const response = await request(app).get("/api/sessions");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true); // Vérifie que la réponse est un tableau
  });

  // Tester la récupération d'une session spécifique
 test("Doit récupérer une session spécifique", async () => {
  console.log("Test récupération session ID:", sessionId);

  const response = await request(app).get(`/api/history/${sessionId}`);

  console.log("Réponse API:", response.body);
  console.log("Statut HTTP reçu:", response.status);

  expect(response.status).toBe(200); 
  expect(response.body).toHaveProperty("sessionId"); // Vérifie que la session a bien un `sessionId`

  expect(response.body.sessionId).toBe(sessionId);

  expect(response.body).toHaveProperty("messages"); // Vérifie que la session contient des messages
  expect(Array.isArray(response.body.messages)).toBe(true); // Vérifie que c'est bien un tableau
});
  // Tester la suppression d'une session existante
  test("Doit supprimer une session", async () => {
    const response = await request(app).delete(`/api/history/${sessionId}`);
    expect(response.status).toBe(200);
  });

  afterAll(async () => {
    await mongoose.connection.close(); 
  });
});
