import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private favoritesSubject = new BehaviorSubject<Set<string>>(new Set<string>());
  public favorites$: Observable<Set<string>> = this.favoritesSubject.asObservable();

  constructor() {
    this.loadFavorites();
  }

  private loadFavorites(): void {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      const favoriteIds = JSON.parse(stored) as string[];
      this.favoritesSubject.next(new Set(favoriteIds));
    }
  }

  private saveFavorites(): void {
    const favoriteIds = Array.from(this.favoritesSubject.value);
    localStorage.setItem('favorites', JSON.stringify(favoriteIds));
  }

  isFavorite(employeeId: string): boolean {
    return this.favoritesSubject.value.has(employeeId);
  }

  toggleFavorite(employeeId: string): void {
    const currentFavorites = new Set(this.favoritesSubject.value);
    
    if (currentFavorites.has(employeeId)) {
      currentFavorites.delete(employeeId);
    } else {
      currentFavorites.add(employeeId);
    }
    
    this.favoritesSubject.next(currentFavorites);
    this.saveFavorites();
  }

  getFavorites(): Set<string> {
    return new Set(this.favoritesSubject.value);
  }
}
