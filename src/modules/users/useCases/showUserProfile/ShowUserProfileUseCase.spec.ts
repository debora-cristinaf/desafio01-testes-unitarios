import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Show user profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });
  it("should be able to list user profile ", async () => {
    const user = await createUserUseCase.execute({
      email: "debora@teste.com",
      name: "Débora",
      password: "239823893298",
    });

    if (user.id) {
      const response = await showUserProfileUseCase.execute(user.id);
      expect(response).toHaveProperty("id");
    }
  });

  it("should throw when user not exists ", async () => {
    try {
      await showUserProfileUseCase.execute("1");
    } catch (error) {
      expect(error).toBeInstanceOf(ShowUserProfileError);
    }
  });
});
