import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Employee } from '../models/employee.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = environment.apiUrl;
  private employeesCache: Employee[] | null = null;
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  public employees$ = this.employeesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    if (this.employeesCache) {
      return new Observable(observer => {
        observer.next(this.employeesCache!);
        observer.complete();
      });
    }

    return this.http.get<Employee[]>(`${this.apiUrl}/employees`).pipe(
      tap(employees => {
        this.employeesCache = employees;
        this.employeesSubject.next(employees);
      })
    );
  }

  getEmployeeById(id: string): Employee | null {
    return this.employeesCache?.find(emp => emp.id === id) || null;
  }

  clearCache(): void {
    this.employeesCache = null;
    this.employeesSubject.next([]);
  }
}
