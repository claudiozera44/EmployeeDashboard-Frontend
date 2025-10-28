import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Employee } from '../../models/employee.model';
import { Note } from '../../models/note.model';
import { EmployeeService } from '../../services/employee.service';
import { FavoritesService } from '../../services/favorites.service';
import { NotesService } from '../../services/notes.service';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeDetailComponent implements OnInit, OnDestroy {
  employee: Employee | null = null;
  notes: Note[] = [];
  newNoteContent: string = '';
  loading: boolean = true;
  loadingNotes: boolean = true;
  submittingNote: boolean = false;
  error: string = '';
  favorites: Set<string> = new Set();
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private favoritesService: FavoritesService,
    private notesService: NotesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmployee(id);
      this.loadNotes(id);
    }

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

  loadEmployee(id: string): void {
    this.loading = true;
    this.employeeService.getEmployees()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (employees) => {
          this.employee = employees.find(emp => emp.id === id) || null;
          this.loading = false;
          if (!this.employee) {
            this.error = 'Employee not found';
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = 'Failed to load employee details';
          this.loading = false;
          this.cdr.markForCheck();
          console.error('Error loading employee:', err);
        }
      });
  }

  loadNotes(employeeId: string): void {
    this.loadingNotes = true;
    this.notesService.getNotesForEmployee(employeeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notes) => {
          this.notes = notes;
          this.loadingNotes = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading notes:', err);
          this.loadingNotes = false;
          this.cdr.markForCheck();
        }
      });
  }

  isFavorite(): boolean {
    return this.employee ? this.favoritesService.isFavorite(this.employee.id) : false;
  }

  toggleFavorite(): void {
    if (this.employee) {
      this.favoritesService.toggleFavorite(this.employee.id);
    }
  }

  submitNote(): void {
    if (!this.employee || !this.newNoteContent.trim()) {
      return;
    }

    this.submittingNote = true;
    this.notesService.createNote(this.employee.id, this.newNoteContent)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (note) => {
          this.notes.unshift(note);
          this.newNoteContent = '';
          this.submittingNote = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error creating note:', err);
          alert('Failed to create note. Please try again.');
          this.submittingNote = false;
          this.cdr.markForCheck();
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
