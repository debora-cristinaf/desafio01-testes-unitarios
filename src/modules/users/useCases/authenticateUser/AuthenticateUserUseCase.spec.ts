import { InMemoryUsersRepository } from "@src/users/repositories/in-memory/InMemoryUsersRepository";
import { hash } from "bcryptjs";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });
  it("should be able to authenticate user", async () => {
    await createUserUseCase.execute({
      name: "name",
      email: "name@email.com",
      password: "1234",
    });

    const response = await authenticateUserUseCase.execute({
      email: "name@email.com",
      password: "1234",
    });

    expect(response).toHaveProperty("token");
  });

  it("should not be able to authenticate a user with incorrect password", async () => {
    try {
      const user = {
        name: "name",
        email: "name@email.com",
        password: "1234",
      };
      await createUserUseCase.execute(user);
      await authenticateUserUseCase.execute({
        email: "error@email.com",
        password: "12345",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(IncorrectEmailOrPasswordError);
    }
  });

  it("should not be able to authenticate a non-existent user", async () => {
    try {
      await authenticateUserUseCase.execute({
        email: "error@email.com",
        password: "1234",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(IncorrectEmailOrPasswordError);
    }
  });
});
