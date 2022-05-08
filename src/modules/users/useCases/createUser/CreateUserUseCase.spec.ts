import { createConnection } from "typeorm";
import { Connection } from "typeorm/connection/Connection";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create a user case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should throw error if user exists", async () => {
    const user = {
      name: "test",
      email: "name@email.com",
      password: "1234",
    };

    await createUserUseCase.execute(user);

    try {
      await createUserUseCase.execute(user);
    } catch (error) {
      expect(error).toBeInstanceOf(CreateUserError);
    }
  });

  it("should create a user", async () => {
    const user = {
      name: "test",
      email: "name@email.com",
      password: "1234",
    };
    const response = await createUserUseCase.execute(user);
    expect(response).toHaveProperty("id");
  });
});
