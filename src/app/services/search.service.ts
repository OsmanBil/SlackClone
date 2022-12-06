import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private subject: Subject<string> = new BehaviorSubject<string>('');
 
  sendData(searchtext: string) {
      this.subject.next(searchtext);
  }


  getData(): Observable<string> {
      return this.subject.asObservable();
  }
}
