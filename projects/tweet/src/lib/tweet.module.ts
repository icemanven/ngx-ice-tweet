import { NgModule } from '@angular/core';
import { TweetComponent } from './tweet.component';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {MatCardModule, MatSelectModule} from '@angular/material';

@NgModule({
  declarations: [TweetComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatSelectModule,
    FormsModule
  ],
  exports: [TweetComponent]
})
export class TweetModule { }
