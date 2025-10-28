import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FavoritesComponent implements OnInit, OnDestroy {
  favoriteEmployees: Employee[] = [];
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
    this.loadFavorites();
    
    this.favoritesService.favorites$
      .pipe(takeUntil(this.destroy$))
      .subscribe(favorites => {
        this.favorites = favorites;
        this.updateFavoritesList();
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFavorites(): void {
    this.loading = true;
    this.employeeService.getEmployees()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (employees) => {
          this.updateFavoritesList(employees);
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = 'Failed to load employees';
          this.loading = false;
          this.cdr.markForCheck();
          console.error('Error loading employees:', err);
        }
      });
  }

  private updateFavoritesList(employees?: Employee[]): void {
    if (!employees && this.favoriteEmployees.length > 0) {
      this.favoriteEmployees = this.favoriteEmployees.filter(emp => 
        this.favoritesService.isFavorite(emp.id)
      );
    } else if (employees) {
      const favoriteIds = this.favoritesService.getFavorites();
      this.favoriteEmployees = employees.filter(emp => favoriteIds.has(emp.id));
    }
  }

  toggleFavorite(event: Event, employeeId: string): void {
    event.stopPropagation();
    this.favoritesService.toggleFavorite(employeeId);
  }

  viewDetails(employeeId: string): void {
    this.router.navigate(['/employee', employeeId]);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
