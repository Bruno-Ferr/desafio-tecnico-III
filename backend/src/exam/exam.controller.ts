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
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';

@Controller('exames')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

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
    console.log('Data:', createExamDto);
    //return this.examService.create(createExamDto, idempotencyKey);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 10) {
    return this.examService.findAll(page, Number(pageSize));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examService.findOne(+id);
  }
}
