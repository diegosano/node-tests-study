import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement Use Case", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to create a new statement", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "User Test",
      email: "",
      password: "1234",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Test",
    });

    expect(statement).toHaveProperty("id");
  });

  it("should not be able to create a new statement with a non-existent user", async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: "non-existent-user",
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "Test",
      })
    ).rejects.toEqual(new CreateStatementError.UserNotFound());
  });

  it("should not be able to create a new statement with insufficient funds", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "User Test",
      email: "",
      password: "1234",
    });

    await expect(
      createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 100,
        description: "Test",
      })
    ).rejects.toEqual(new CreateStatementError.InsufficientFunds());
  });
});
