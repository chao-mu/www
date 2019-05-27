import auth0 from 'auth0-js';

class Auth {
  loc = window.location;
  baseUrl = this.loc.protocol + "//" + this.loc.hostname + (this.loc.port? ":"+this.loc.port : "");

  clientID = '4qhDa1YiGaMibkZr0zKH0Tcx4nbzsg90';
  auth0 = new auth0.WebAuth({
    domain: 'dev-www.auth0.com',
    clientID: this.clientID,
    redirectUri: this.baseUrl + '/callback',
    responseType: 'token id_token',
    scope: 'openid'
  });

  getProfile() {
    return this.profile;
  }
        color: white;

  getIdToken() {
    return this.idToken;
  }

  isAuthenticated() {
    return new Date().getTime() < this.expiresAt;
  }

  login() {
    this.auth0.authorize();
  }

  handleAuthentication() {
    return new Promise((resolve, reject) => {
      this.auth0.parseHash((err, authResult) => {
        if (err) return reject(err);
        if (!authResult || !authResult.idToken) {
          return reject(err);
        }
        this.setSession(authResult);
        resolve();
      });
    })
  }

  setSession(authResult) {
    this.idToken = authResult.idToken;
    this.profile = authResult.idTokenPayload;
    // set the time that the id token will expire at
    this.expiresAt = authResult.idTokenPayload.exp * 1000;
  }

  logout() {
    this.auth0.logout({
      returnTo: this.baseUrl,
      clientID: this.clientID,
    });
  }

  silentAuth() {
    return new Promise((resolve, reject) => {
      this.auth0.checkSession({}, (err, authResult) => {
        if (err) return reject(err);
        this.setSession(authResult);
        resolve();
      });
    });
  }
}

const authClient = new Auth();

export default authClient;
