import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";

import {  throwError } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})


export class DataService {

public first: string = "";
public prev: string = "";
public next: string = "";
public last: string = "";

parseLinkHeader(header) {
  if (header.length == 0) {
    return ;
  }

  let parts = header.split(',');
  var links = {};
  parts.forEach( p => {
    let section = p.split(';');
    var url = section[0].replace(/<(.*)>/, '$1').trim();
    var name = section[1].replace(/rel="(.*)"/, '$1').trim();
    links[name] = url;

  });

  this.first  = links["first"];
  this.last   = links["last"];
  this.prev   = links["prev"];
  this.next   = links["next"];
}
/* We imported and injected the HttpClient service as a private httpClient instance. We also defined the REST_API_SERVER variable that holds the address of our REST API server. */

  private REST_API_SERVER ="http://localhost:3000/products";

  constructor(private httpClient: HttpClient) { }
/*
 In this step, we'll proceed to add error handling in our example application.

The Angular's HttpClient methods can be easily used with the catchError() operator from RxJS, since they return Observables, via the pipe() method for catching and handling errors. We simply need to define a method to handle errors within your service.
 */
handleError(error: HttpErrorResponse) {
  let errorMessage = 'Unknown error!';
  if (error.error instanceof ErrorEvent) {
    // Client-side errors
    errorMessage = `Error: ${error.error.message}`;
  } else {
    // Server-side errors
    errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
  }
  window.alert(errorMessage);
  return throwError(errorMessage);
}


/* add a sendGetRequest() method that sends a GET request to the REST API endpoint to retrieve JSON data: The method simply invokes the get() method of HttpClient to send GET requests to the REST API server. */
public sendGetRequest(){
  // Add safe, URL encoded _page and _limit parameters

  return this.httpClient.get(this.REST_API_SERVER, {  params: new HttpParams({fromString: "_page=1&_limit=20"}), observe: "response"}).pipe(retry(3), catchError(this.handleError), tap(res => {
    console.log(res.headers.get('Link'));
    this.parseLinkHeader(res.headers.get('Link'));
  }));
}

/* This method is similar to sendGetRequest() except that it takes the URL to which we need to send an HTTP GET request. */

public sendGetRequestToUrl(url: string){
  return this.httpClient.get(url, { observe: "response"}).pipe(retry(3), catchError(this.handleError), tap(res => {
    console.log(res.headers.get('Link'));
    this.parseLinkHeader(res.headers.get('Link'));

  }));
}

}
