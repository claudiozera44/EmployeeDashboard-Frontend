import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  error: string = '';
  favorites: Set<string> = new Set();
  private destroy$ = new Subject<void>();

  constructor(
    private employeeService: EmployeeService,
    private favoritesService: FavoritesService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.favoritesService.favorites$
      .pipe(takeUntil(this.destroy$))
      .subscribe(favorites => {
        this.favorites = favorites;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployees(): void {
    this.loading = true;
    this.error = '';
    
    this.employeeService.getEmployees()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.employees = data;
          this.filteredEmployees = data;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = 'Failed to load employees. Please try again later.';
          this.loading = false;
          this.cdr.markForCheck();
          console.error('Error loading employees:', err);
        }
      });
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (!term) {
      this.filteredEmployees = this.employees;
      return;
    }
    
    this.filteredEmployees = this.employees.filter(employee =>
      employee.firstName.toLowerCase().includes(term) ||
      employee.lastName.toLowerCase().includes(term)
    );
  }

  isFavorite(employeeId: string): boolean {
    return this.favoritesService.isFavorite(employeeId);
  }

  toggleFavorite(event: Event, employeeId: string): void {
    event.stopPropagation();
    this.favoritesService.toggleFavorite(employeeId);
  }

  viewDetails(employeeId: string): void {
    this.router.navigate(['/employee', employeeId]);
  }
}
