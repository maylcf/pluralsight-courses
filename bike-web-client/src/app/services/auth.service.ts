import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import * as auth0 from 'auth0-js';

@Injectable()
export class AuthService {

  auth0 = new auth0.WebAuth({
    clientID: '9YAaf3Qu1F3IYHo4phB9BpK7RPDJgJBE',
    domain: 'mayarafelix.us.auth0.com',
    responseType: 'token id_token',
    audience: 'http://localhost:8080',
    redirectUri: 'http://localhost:4200/callback',
    scope: 'openid view:registration view:registrations'
  });

  constructor(public router: Router) {}

  public login(): void {
    this.auth0.authorize();
  }

  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.setSession(authResult);
        this.router.navigate(['/admin']);
      } else if (err) {
        this.router.navigate(['/admin']);
        console.log(err);
      }
    });
  }

  private setSession(authResult): void {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    // Go back to the home route
    this.router.navigate(['/']);
  }
  
  // Check whether the current time is past the
  // access token's expiry time
  public isAuthenticated(): boolean {
    const localInfo = localStorage.getItem('expires_at');
    if (localInfo == null) {
      return false
    } else {
      const expiresAt = JSON.parse(localInfo);
      return new Date().getTime() < expiresAt;
    }
  }

}
