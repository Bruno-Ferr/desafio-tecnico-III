import { CommonModule } from '@angular/common';
import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-list-component',
  imports: [MatPaginatorModule, MatProgressSpinnerModule, CommonModule],
  templateUrl: './list-component.html',
  styleUrl: './list-component.css',
})
export class ListComponent<T> {
  @Input() items: T[] = [];
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() isLoading: boolean = false;
  @Input() listType: 'patients' | 'exams' = 'patients';

  @ContentChild(TemplateRef) itemTemplate!: TemplateRef<any>;
  
  @Output() pageChange = new EventEmitter<PageEvent>();

  pageSizeOptions: number[] = [5, 10, 15];

  handlePageEvent(event: PageEvent) {
    this.pageChange.emit(event);
  }
}
