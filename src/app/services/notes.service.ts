import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Note, CreateNoteRequest } from '../models/note.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getNotesForEmployee(employeeId: string): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl}/employees/${employeeId}/notes`);
  }

  createNote(employeeId: string, content: string): Observable<Note> {
    const request: CreateNoteRequest = { content };
    return this.http.post<Note>(`${this.apiUrl}/employees/${employeeId}/notes`, request);
  }
}
