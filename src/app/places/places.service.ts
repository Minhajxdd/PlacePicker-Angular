import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Place } from './place.model';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private errorService = inject(ErrorService);
  private httpClient = inject(HttpClient);
  private userPlaces = signal<Place[]>([]);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces('http://localhost:3000/places',
      'Something went wrong fetching the available places. Please try again later.');
  }

  loadUserPlaces() {
    return this.fetchPlaces(`http://localhost:3000/user-places`,
      'Something went wrong fetching the favourite places. Please try again later.'
    ).pipe(
      tap({
        next: (userPlaces) => this.userPlaces.set(userPlaces)
      }));

  }

  addPlaceToUserPlaces(place: Place) {
    const previousPlace = this.userPlaces();

    if (!previousPlace.some((p) => p.id === place.id)) {
      this.userPlaces.set([...previousPlace, place]);

    }

    return this.httpClient.put(`http://localhost:3000/user-places`, {
      placeId: place.id
    })
      .pipe(
        catchError((err) => {
          this.userPlaces.set(previousPlace);
          this.errorService.showError(`Failed to store selected place`);
          return throwError(() => new Error(`Failed to store selected place`));
        })
      )
  }

  removeUserPlace(place: Place) {
    const prePlaces = this.userPlaces();

    if (prePlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set(prePlaces.filter((p) => p.id !== place.id));
    }

    return this.httpClient
      .delete(`http://localhost:3000/user-places/${place.id}`)
      .pipe(
        catchError((err) => {
          this.userPlaces.set(prePlaces);
          this.errorService.showError('Failed to remove selected place');
          return throwError(
            () => new Error('Failed to remove selected place')
          );
        })
      )
  }

  private fetchPlaces(url: string, errorMsg: string) {
    return this.httpClient.get<{ places: Place[] }>(url)
      .pipe(
        map((resData) => resData.places),
        catchError((error) => {
          console.log(error);
          return throwError(
            () => {
              new Error(errorMsg)
            }
          )
        })
      )
  }

}
