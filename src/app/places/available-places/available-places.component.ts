import {Component, DestroyRef, inject, signal} from '@angular/core';
import  { map } from 'rxjs'

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent{
  places = signal<Place[] | undefined>(undefined);
  private httpClient = inject(HttpClient);
  private destoryRef = inject(DestroyRef);

  ngOnInit() {
    const subscription = this.httpClient.get<{ places: Place[ ] }>(`http://localhost:3000/places`)
      .pipe(
        map((resData) => resData.places)
      )
      .subscribe({
      next: places => {
        this.places.set(places);
      }
    })

    this.destoryRef.onDestroy(() => {
      subscription.unsubscribe();
    })
  }
}
