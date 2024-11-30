import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Place } from './place.model';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);
  private httpClient = inject(HttpClient);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces('http://localhost:3000/places',
      'Something went wrong fetching the available places. Please try again later.');
  }

  loadUserPlaces() {
    return this.fetchPlaces(`http://localhost:3000/user-places`,
      'Something went wrong fetching the favourite places. Please try again later.')
    
  }

  addPlaceToUserPlaces(placeId: string) {
    return this.httpClient.put(`http://localhost:3000/user-places`, {
      placeId: placeId
    })
   }

  removeUserPlace(place: Place) { }

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
