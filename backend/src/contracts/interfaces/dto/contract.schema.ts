import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const contractSchema = z.object({
  number: z.string().min(1, 'Número é obrigatório'),
  clientId: z.string().uuid('Cliente inválido'),
  value: z.coerce.number().positive('Valor deve ser positivo'),
  dueDate: z.coerce.date(),
});

export class ContractDto extends createZodDto(contractSchema) {}
