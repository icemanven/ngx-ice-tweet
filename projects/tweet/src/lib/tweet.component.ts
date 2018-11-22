import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

const TweetConfig = {
  tokenUrl: 'https://api.twitter.com/oauth2/token',
  tweetSearchUrl: 'https://api.twitter.com/1.1/search/tweets.json'
};

interface Token {
  token_type: string;
  access_token: string;
}

interface Tweets {
  created_at: Date;
  id: number;
  id_str: string;
  text: string;
  user: any;
  entities: any;
}

@Component({
  selector: 'tweet',
  template: `<div class="container" *ngIf="tweets && tweets.length > 0">
    <div>
      <h4>filter by:</h4>
      <mat-form-field>
        <mat-select [(value)]="filterBy">
          <mat-option *ngFor="let opt of filterOptions" value="opt">{{opt}}</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  <mat-card
    *ngFor="let tt of setFilterBy()"
  >
    <mat-card-header>
      <mat-card-title>{{tt.user.screen_name}}</mat-card-title>
      <mat-card-subtitle>@{{tt.user.name}}</mat-card-subtitle>
    </mat-card-header>
    <img matCardImage [src]="tt.user.profile_image_url">
    <mat-card-content>
      {{tt.text}}
    </mat-card-content>
    <mat-card-actions align="start">
      <!--<button mat-button (click)="onAction1">Action1</button>-->
    </mat-card-actions>
    <mat-card-footer>

    </mat-card-footer>
  </mat-card>
  </div>`,
  styles: [`
    .container {
      width: 100%;
      margin: 2rem;
      display: flex;
      flex-direction: column;
    }
  mat-card {
    margin-bottom: 2rem;
    flex: 1 1 100%;
  }`],
  encapsulation: ViewEncapsulation.Native
})
export class TweetComponent implements OnInit, OnDestroy {
  @Input() keyPublic: string;
  @Input() keyPrivate: string;
  @Input() hashTag: string;
  @Output() errorMesage = new EventEmitter<string>();
  private _unsubscribeAll: Subject<any>;
  tweets: Tweets[];
  filterBy = 'created_at';
  filterOptions = ['created_at', 'text', 'user.name'];

  constructor(private http: HttpClient) {
    this._unsubscribeAll = new Subject();
  }
  ngOnInit(): void {
    if (this.evalData()) {
      this.getToken();
    } else {
      this.sendErrorMesage('No Public, Privite Key');
      this.ngOnDestroy();
    }
  }
  setFilterBy() {
    return this.tweets.sort((a, b) => a[this.filterBy] > b[this.filterBy] ? 1 : a[this.filterBy] === b[this.filterBy] ? 0 : -1);
  }
  private evalData(): boolean {
    return (
      this.keyPublic && this.keyPrivate
      && this.keyPublic !== null && this.keyPrivate !== null
      && this.keyPublic !== '' && this.keyPrivate !== ''
    );
  }
  private evaHash(): boolean {
    return (
      this.hashTag
      && this.hashTag !== null
      && this.hashTag !== ''
    );
  }
  private evalToken (token: Token) {
    return (
      token.token_type && token.access_token
      && token.token_type !== null && token.access_token !== null
      && token.token_type !== '' && token.access_token !== ''
    );
  }
  private getToken(): void {
    if (this.evaHash()) {
      const basic = btoa(`${this.keyPublic}:${this.keyPrivate}`);
      const headers = new HttpHeaders({
        'Content-Type'  : 'application/x-www-form-urlencoded',
        'Authorization'   : `Basic  ${basic}`
      });
      const payload = new FormData();
      payload.append('grant_type', 'client_credentials');
      this.http.post<Token>(TweetConfig.tokenUrl, payload, { headers: headers})
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(
          token => this.getTweetList(token),
          error => this.sendErrorMesage(error)
        );
    } else {
      this.sendErrorMesage('No HasgTag set For Searching');
    }
  }
  private getTweetList(token: Token) {
    if (this.evalToken(token)) {
      const headers = new HttpHeaders({
        'Authorization'   : `${token.token_type} ${token.access_token}`
      });
      const params = new HttpParams().set('q', `%23${this.hashTag}`);
      this.http.get<any>(TweetConfig.tweetSearchUrl, {headers: headers, params: params})
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(
          ({statuses}) => this.tweets = <Tweets[]>statuses,
          error => this.sendErrorMesage(error)
        );
    } else {
      this.sendErrorMesage('Error Tweeter Token');
    }
  }
  private sendErrorMesage(men: string): void {
    this.errorMesage.emit(men);
  }
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
