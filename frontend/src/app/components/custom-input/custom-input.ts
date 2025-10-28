import { Component, Input } from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-input',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './custom-input.html',
  styleUrl: './custom-input.css',
})
export class CustomInput {
  @Input() form!: FormGroup;
  @Input() controlName!: string
  @Input() label!: string;
  @Input() type: string = 'text';

  constructor() { }

  public get control(): AbstractControl | null {
    return this.form ? this.form.get(this.controlName) : null;
  }

  public get showError(): boolean {
    if (!this.control) {
      return false;
    }
    return this.control.invalid && (this.control.touched || this.control.dirty);
  }
}
