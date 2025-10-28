import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomInput } from '../../components/custom-input/custom-input';
import { CustomSelectComponent } from '../../components/custom-select/custom-select';

export interface Exam {
  nome: string;
  cpf: string;
  // ...outros campos
}

@Component({
  selector: 'app-exams-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomInput,
    CustomSelectComponent
  ],
  templateUrl: './exams-form.html',
  styleUrl: './exams-form.css',
})
export class ExamsForm {
  @Input() initialExam!: Exam;
  @Input() patientId!: string;
  
  // Envia os dados do formulário quando for válido
  @Output() save = new EventEmitter<Exam>();
  @Output() cancel = new EventEmitter<void>();

  examForm!: FormGroup;

  modalityOptions = [
    { value: 'CR', label: 'CR - Computed Radiography' },
    { value: 'CT', label: 'CT - Computed Tomography' },
    { value: 'DX', label: 'DX - Digital Radiography' },
    { value: 'MG', label: 'MG - Mammography' },
    { value: 'MR', label: 'MR - Magnetic Resonance' },
    { value: 'NM', label: 'NM - Nuclear Medicine' },
    { value: 'OT', label: 'OT - Other' },
    { value: 'PT', label: 'PT - Positron Emission Tomography' },
    { value: 'RF', label: 'RF - Radio Fluoroscopy' },
    { value: 'US', label: 'US - Ultrasound' },
    { value: 'XA', label: 'XA - X-Ray Angiography' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.examForm = this.fb.group({
      patientId: [this.patientId || '', Validators.required], 
      modality: ['', Validators.required]
    });

    if (this.initialExam) {
      this.examForm.patchValue(this.initialExam);
    }
  }

  onSubmit() {
    if (this.examForm.invalid) {
      this.examForm.markAllAsTouched();
      return;
    }
    this.save.emit(this.examForm.value);
  }

  onCancel() {
    this.cancel.emit();
  }
}
