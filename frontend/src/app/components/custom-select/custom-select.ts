import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './custom-select.html',
  styleUrl: './custom-select.css',
})
export class CustomSelectComponent {
  @Input() label: string = '';
  @Input() form!: FormGroup;
  @Input() controlName: string = '';
  @Input() options: { value: string; label: string }[] = [];
  @Input() placeholder: string = 'Selecione uma opção';

  get control() {
    return this.form.get(this.controlName);
  }

  get hasError() {
    return this.control?.invalid && this.control?.touched;
  }

  get errorMessage(): string {
    if (this.control?.hasError('required')) {
      return `${this.label} é obrigatório`;
    }
    return '';
  }
}
