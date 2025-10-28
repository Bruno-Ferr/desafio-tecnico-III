import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class Form {
  @Input() title!: string;
  @Input() form!: FormGroup;
  @Input() loading: boolean = false;
  @Output() onSubmit = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
}
