import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  error: string = '';
  favorites: Set<string> = new Set();

  constructor(
    private employeeService: EmployeeService,
    private favoritesService: FavoritesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.favoritesService.favorites$.subscribe(favorites => {
      this.favorites = favorites;
    });
  }

  loadEmployees(): void {
    this.loading = true;
    this.error = '';
    
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.filteredEmployees = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load employees. Please try again later.';
        this.loading = false;
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
