import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  notes: Note[] = [];
  newNoteContent: string = '';
  loading: boolean = true;
  loadingNotes: boolean = true;
  submittingNote: boolean = false;
  error: string = '';
  favorites: Set<string> = new Set();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private favoritesService: FavoritesService,
    private notesService: NotesService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmployee(id);
      this.loadNotes(id);
    }

    this.favoritesService.favorites$.subscribe(favorites => {
      this.favorites = favorites;
    });
  }

  loadEmployee(id: string): void {
    this.loading = true;
    console.log('Loading employee with ID:', id);
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        console.log('Received employees count:', employees.length);
        console.log('Looking for employee with ID:', id);
        console.log('First employee ID:', employees.length > 0 ? employees[0].id : 'none');
        this.employee = employees.find(emp => emp.id === id) || null;
        this.loading = false;
        if (!this.employee) {
          console.log('Employee not found! ID:', id);
          this.error = 'Employee not found';
        } else {
          console.log('Employee found:', this.employee.firstName, this.employee.lastName);
        }
      },
      error: (err) => {
        this.error = 'Failed to load employee details';
        this.loading = false;
        console.error('Error loading employee:', err);
      }
    });
  }

  loadNotes(employeeId: string): void {
    this.loadingNotes = true;
    this.notesService.getNotesForEmployee(employeeId).subscribe({
      next: (notes) => {
        this.notes = notes;
        this.loadingNotes = false;
      },
      error: (err) => {
        console.error('Error loading notes:', err);
        this.loadingNotes = false;
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
    this.notesService.createNote(this.employee.id, this.newNoteContent).subscribe({
      next: (note) => {
        this.notes.unshift(note);
        this.newNoteContent = '';
        this.submittingNote = false;
      },
      error: (err) => {
        console.error('Error creating note:', err);
        alert('Failed to create note. Please try again.');
        this.submittingNote = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
