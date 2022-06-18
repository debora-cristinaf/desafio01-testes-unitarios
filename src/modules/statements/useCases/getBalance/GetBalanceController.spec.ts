import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get balance", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const password = await hash("1234", 8);

    await connection.query(`
      INSERT INTO users
        (id, name, email, password, created_at, updated_at)
      VALUES
        ('556e2f0f-f1f1-4a56-af58-d786bf0c3a61', 'User 01', 'user1@test.com', '${password}', 'now()', 'now()')
    `);

    await connection.query(`
      INSERT INTO users
        (id, name, email, password, created_at, updated_at)
      VALUES
        ('4ff077e4-01ba-4c7e-ba1a-ee2cd05c366f', 'User 02', 'user2@test.com', '${password}', 'now()', 'now()')
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get account balance", async () => {
    const responseToken01 = await request(app).post("/api/v1/sessions").send({
      email: "user1@test.com",
      password: "1234",
    });
    const { token } = responseToken01.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 300,
        description: "Depositing $300",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "Withdrawing $100",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    await request(app)
      .post(`/api/v1/statements/transfer/556e2f0f-f1f1-4a56-af58-d786bf0c3a61`)
      .send({
        amount: 100,
        description: "Test transfer $100",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseToken02 = await request(app).post("/api/v1/sessions").send({
      email: "user2@test.com",
      password: "1234",
    });

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "Depositing $200",
      })
      .set({
        Authorization: `Bearer ${responseToken02.body.token}`,
      });

    await request(app)
      .post(`/api/v1/statements/transfer/4ff077e4-01ba-4c7e-ba1a-ee2cd05c366f`)
      .send({
        amount: 150,
        description: "Test transfer $150",
      })
      .set({
        Authorization: `Bearer ${responseToken02.body.token}`,
      });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
  });
});
