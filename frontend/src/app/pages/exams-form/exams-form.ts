import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomInput } from '../../components/custom-input/custom-input';

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
    CustomInput
  ],
  templateUrl: './exams-form.html',
  styleUrl: './exams-form.css',
})
export class ExamsForm {
  @Input() initialExam!: Exam; 
  
  // Envia os dados do formulário quando for válido
  @Output() save = new EventEmitter<Exam>(); 
  @Output() cancel = new EventEmitter<void>();

  examForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.examForm = this.fb.group({
      nome: ['', Validators.required],
      cpf: ['', Validators.required]
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
