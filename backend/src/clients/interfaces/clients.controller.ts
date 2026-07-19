import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { CreateClientUseCase } from '../application/use-cases/create-client.use-case';
import { UpdateClientUseCase } from '../application/use-cases/update-client.use-case';
import { DeleteClientUseCase } from '../application/use-cases/delete-client.use-case';
import { ListClientsUseCase } from '../application/use-cases/list-clients.use-case';
import { GetClientUseCase } from '../application/use-cases/get-client.use-case';
import { ClientDto } from './dto/client.schema';

@Controller('clients')
export class ClientsController {
  constructor(
    private readonly createClient: CreateClientUseCase,
    private readonly updateClient: UpdateClientUseCase,
    private readonly deleteClient: DeleteClientUseCase,
    private readonly listClients: ListClientsUseCase,
    private readonly getClient: GetClientUseCase,
  ) {}

  @Get()
  async list() {
    const clients = await this.listClients.execute();
    return { data: clients };
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    const client = await this.getClient.execute(id);
    return { data: client };
  }

  @Post()
  async create(@Body() body: ClientDto) {
    const client = await this.createClient.execute(body);
    return { data: client };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: ClientDto) {
    const client = await this.updateClient.execute(id, body);
    return { data: client };
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.deleteClient.execute(id);
  }
}
