import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe('Get Balance Use Case', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it('should be able to get the balance', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Test',
      email: 'user@teste.com',
      password: '1234',
    });

    await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Test',
    });

    const balance = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(balance).toHaveProperty('balance');
  });

  it('should not be able to get the balance of a non-existent user', async () => {
    await expect(
      getBalanceUseCase.execute({
        user_id: 'non-existent-user',
      })
    ).rejects.toBeInstanceOf(GetBalanceError);
  });

  it('should be able to get the balance with statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Test',
      email: 'user@teste.com',
      password: '1234',
    });

    await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Deposit Test',
    });

    await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: 'Withdraw Test',
    });

    const balance = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(balance).toHaveProperty('balance', 50);
  });
});
