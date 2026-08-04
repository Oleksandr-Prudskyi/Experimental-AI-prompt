import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const details: Record<string, string[]> = {};
      result.error.errors.forEach((err) => {
        const key = err.path.join('.');
        if (!details[key]) details[key] = [];
        details[key].push(err.message);
      });
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Chyba validace',
        details,
      });
    }
    return result.data;
  }
}
