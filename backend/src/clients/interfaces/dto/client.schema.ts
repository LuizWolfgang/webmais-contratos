import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  document: z.string().min(1, 'Documento é obrigatório'),
});

export class ClientDto extends createZodDto(clientSchema) {}
