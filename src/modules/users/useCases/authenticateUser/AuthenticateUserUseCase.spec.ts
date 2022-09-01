import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to authenticate an user", async () => {
    const passwordHash = await hash("1234", 8);

    await inMemoryUsersRepository.create({
      name: "User Test",
      email: "user@test.com",
      password: passwordHash,
    });

    const response = await authenticateUserUseCase.execute({
      email: "user@test.com",
      password: "1234",
    });

    expect(response).toHaveProperty("token");
  });

  it("should not be able to authenticate an nonexistent user", async () => {
    await expect(
      authenticateUserUseCase.execute({
        email: "nonexistent-user@test.com",
        password: "1234",
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate with incorrect password", async () => {
    await inMemoryUsersRepository.create({
      name: "User Test",
      email: "user@test.com",
      password: "1234",
    });

    await expect(
      authenticateUserUseCase.execute({
        email: "user@test.com",
        password: "incorrect-password",
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
