import { Routes } from '@angular/router';
import { Patients } from './pages/patients/patients';
import { Exams } from './pages/exams/exams';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pacientes',
    pathMatch: 'full'
  },
  {
    path: 'pacientes',
    component: Patients
  }, 
  {
    path: 'exames/:id',
    component: Exams
  }
];
