import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put } from '@nestjs/common';
import { CreateContractUseCase } from '../application/use-cases/create-contract.use-case';
import { UpdateContractUseCase } from '../application/use-cases/update-contract.use-case';
import { DeleteContractUseCase } from '../application/use-cases/delete-contract.use-case';
import { CloseContractUseCase } from '../application/use-cases/close-contract.use-case';
import { ListContractsUseCase } from '../application/use-cases/list-contracts.use-case';
import { GetContractsSummaryUseCase } from '../application/use-cases/get-contracts-summary.use-case';
import { GetContractUseCase } from '../application/use-cases/get-contract.use-case';
import { ContractDto } from './dto/contract.schema';

@Controller('contracts')
export class ContractsController {
  constructor(
    private readonly createContract: CreateContractUseCase,
    private readonly updateContract: UpdateContractUseCase,
    private readonly deleteContract: DeleteContractUseCase,
    private readonly closeContract: CloseContractUseCase,
    private readonly listContracts: ListContractsUseCase,
    private readonly getSummary: GetContractsSummaryUseCase,
    private readonly getContract: GetContractUseCase,
  ) {}

  @Get()
  async list() {
    return { data: await this.listContracts.execute() };
  }

  @Get('summary')
  async summary() {
    return { data: await this.getSummary.execute() };
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    return { data: await this.getContract.execute(id) };
  }

  @Post()
  async create(@Body() body: ContractDto) {
    return { data: await this.createContract.execute(body) };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: ContractDto) {
    return { data: await this.updateContract.execute(id, body) };
  }

  @Patch(':id/close')
  async close(@Param('id') id: string) {
    return { data: await this.closeContract.execute(id) };
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.deleteContract.execute(id);
  }
}
