import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { JwtHelper } from 'angular2-jwt';


@Injectable()
export class PostcommentsService {

  public id;
  public jwt;
  public decodedJwt;
  public token;
  public jwtHelper: JwtHelper = new JwtHelper();
  //public url = 'http://hcmutefslio.herokuapp.com/';
  public url = 'https://hcmutefslio.herokuapp.com/api/v1/house/detail/comment';

  constructor(private http: Http) {
    this.jwt = JSON.parse(localStorage.getItem('currentUser'));
    if (this.jwt) {
      this.token = this.jwt.token;
    }
  }
  postComment(content): Observable<any> {
    var token = JSON.parse(localStorage.getItem('currentUser')).token;
    let headers = new Headers({
      'Authorization': token,
      'Accept': 'application/json'
    });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(this.url, content, options).map((res) => res.json());
  }
  getInfoUser(): Observable<any> {
    var token = JSON.parse(localStorage.getItem('currentUser')).token;
    var id = this.jwtHelper.decodeToken(token).id;
    let headers = new Headers({
      'Authorization': token,
      'Accept': 'application/json'
    });
    let options = new RequestOptions({ headers: headers });
    return this.http.get('http://hcmutefslio.herokuapp.com/api/v1/user/' + id, options).map((res) => res.json().results);
  }

}
