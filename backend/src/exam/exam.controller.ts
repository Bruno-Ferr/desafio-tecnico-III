import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ExamsService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';

@Controller('exames')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  create(
    @Body() createExamDto: CreateExamDto,
    @Headers('X-Idempotency-Key') idempotencyKey: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException(
        'O cabeçalho X-Idempotency-Key é obrigatório.',
      );
    }

    return this.examsService.create(createExamDto, idempotencyKey);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 10) {
    return this.examsService.findAll(pageSize, page);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(+id);
  }
}
