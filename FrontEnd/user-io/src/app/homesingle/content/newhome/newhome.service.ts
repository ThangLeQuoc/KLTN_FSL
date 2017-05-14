import { Injectable } from '@angular/core';
import { Http } from "@angular/http";
import { NewHouse } from "./newhouse";
import 'rxjs/add/operator/toPromise';
import 'rxjs/Rx';
import { Observable } from "rxjs/Observable";

@Injectable()
export class NewhomeService {

  private apiUrl="http://localhost:3300/";

  constructor(private http: Http) { }

  /**Get six the houses when user load page home user */
  getSixHouses(): Observable<NewHouse[]> {
    let newhomeapi = this.apiUrl + "api/v1/gethouse";
    console.log('This is service load...');
    return this.http.get(newhomeapi).map(res => res.json());
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
