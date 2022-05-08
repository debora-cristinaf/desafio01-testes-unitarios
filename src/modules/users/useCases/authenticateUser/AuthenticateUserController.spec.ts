import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";
import { v4 as uuidV4 } from "uuid";

let connection: Connection;

describe("Authenticate user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("1234", 8);

    await connection.query(`
      INSERT INTO users
        (id, name, email, password, created_at, updated_at)
      VALUES
        ('${id}', 'Name Test', 'name@email.com', '${password}', 'now()', 'now()')
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "name@email.com",
      password: "1234",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });
});
