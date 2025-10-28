import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomInput } from '../../components/custom-input/custom-input';

export interface Paciente {
  nome: string;
  cpf: string;
  // ...outros campos
}

@Component({
  selector: 'app-pacient-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomInput
  ],
  templateUrl: './pacient-form.html',
  styleUrl: './pacient-form.css',
})
export class PacientForm {
  @Input() initialPatient!: Paciente; 
  
  // Envia os dados do formulário quando for válido
  @Output() save = new EventEmitter<Paciente>(); 
  @Output() cancel = new EventEmitter<void>();

  patienteForm!: FormGroup;
  
  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.patienteForm = this.fb.group({
      nome: ['', Validators.required],
      cpf: ['', Validators.required]
    });

    if (this.initialPatient) {
      this.patienteForm.patchValue(this.initialPatient);
    }
  }

  onSubmit() {
    if (this.patienteForm.invalid) {
      this.patienteForm.markAllAsTouched();
      return;
    }
    this.save.emit(this.patienteForm.value);
  }

  onCancel() {
    this.cancel.emit();
  }
}
