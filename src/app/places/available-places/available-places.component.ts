import { Component, DestroyRef, inject, signal } from '@angular/core';
import { catchError, map, throwError } from 'rxjs'

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from "@angular/common/http";
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent {
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);
  error = signal('');

  private placesService = inject(PlacesService)
  private destoryRef = inject(DestroyRef);

  ngOnInit() {
    this.isFetching.set(true);
    const subscription =
      this.placesService
        .loadAvailablePlaces()
        .subscribe({
          next: places => {
            this.places.set(places);
          },
          error: (err: Error) => {
            console.log(err);
            this.error.set(err.message);
          },
          complete: () => {
            this.isFetching.set(false);
          }
        })

    this.destoryRef.onDestroy(() => {
      subscription.unsubscribe();
    })
  }
  onSelectedPlace(selectedPlace: Place) {

    const subscription = this.placesService.addPlaceToUserPlaces(selectedPlace.id)
      .subscribe({
        next: (resData) => console.log(resData)
      });

    this.destoryRef.onDestroy(() => {
      subscription.unsubscribe();
    })
  }

}
