import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';

@Controller('pacientes')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientService.create(createPatientDto);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 10) {
    return this.patientService.findAll(page, Number(pageSize));
  }
}
