import * as Rx from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Letter } from '../../models/letter.interface'

/*
  Generated class for the Socket provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Socket {
  private _socket: any;
  private _lettersStream: Rx.Observable<Letter[]>;

  constructor() {
    this._socket = io.connect('http://localhost:8080');
    this._lettersStream = Rx.Observable.fromEvent<Letter[]>(this._socket, 'letter');
  }

  get lettersStream() : Rx.Observable<Letter[]> {
    return this._lettersStream;
  }
}

