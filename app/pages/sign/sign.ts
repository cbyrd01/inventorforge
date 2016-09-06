import {Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Slides} from 'ionic-angular';
import {waitRendered} from './util';
import {Letter} from '../../models/letter.interface';
import {ConfigHolder} from '../../providers/config/configholder';
import * as io from 'socket.io-client';


@Component({
  templateUrl: 'build/pages/sign/sign.html'
})
export class SignPage {

  private _socket: any;
  private _config: any;

  @ViewChild('letterSlider') letterSlider: Slides;

  public letters: Letter[] = [
    {label: 'F', red: 0, green: 0, blue: 0, bgcolor: '#000000'},
    {label: 'O', red: 0, green: 0, blue: 0, bgcolor: '#000000'},
    {label: 'R', red: 0, green: 0, blue: 0, bgcolor: '#000000'},
    {label: 'G', red: 0, green: 0, blue: 0, bgcolor: '#000000'},
    {label: 'E', red: 0, green: 0, blue: 0, bgcolor: '#000000'}
  ];

  constructor(private navController: NavController, private _elementRef: ElementRef, private configHolder : ConfigHolder) {
    this._config = configHolder.config;

    let serverUrl = 'http://localhost:8080'; // Default
    if(typeof this._config["network"] != "undefined" &&
      typeof this._config["network"]["socketUrl"] != "undefined") {
      serverUrl = this._config["network"]["socketUrl"];
    }
    
    this._socket = io.connect(serverUrl);

    this._socket.on("letter", (msg) => {
      console.log(msg);
      if(msg.red != undefined) {
        this.setRed(msg.red, msg.letter, false);
      }
      if(msg.green != undefined) {
        this.setGreen(msg.green, msg.letter, false);
      }
      if(msg.blue != undefined) {
        this.setBlue(msg.blue, msg.letter, false);
      }
    });

    this._socket.on("connect", (msg) => {
      console.log("Connected!");
    });
  }

  // Hack from https://github.com/GerritErpenstein/ionic2-slides-temp-fix/
  public ngOnInit() {
    let swiperContainer = this._elementRef.nativeElement.getElementsByClassName('swiper-container')[0];
      waitRendered(swiperContainer).then(() => {
      let swiper = this.letterSlider.getSlider();
      swiper.update();
    });
  }

  public nextSlide() {
    this.letterSlider.slideNext();
  }

  public prevSlide() {
    this.letterSlider.slidePrev();
  }


  public setRed(newValue: number, i: number, update:boolean = true) {
    this.letters[i].red = newValue;
    this.letters[i].bgcolor = this.calculateColor(i);
    if(update) {
      this._socket.emit('letter', {letter: i, red: newValue});
    }
  }
  public setGreen(newValue: number, i: number, update:boolean = true) {
    this.letters[i].green = newValue;
    this.letters[i].bgcolor = this.calculateColor(i);
    if(update) {
      this._socket.emit('letter', {letter: i, green: newValue});
    }
  }
  public setBlue(newValue: number, i: number, update:boolean = true) {
    this.letters[i].blue = newValue;
    this.letters[i].bgcolor = this.calculateColor(i);
    if(update) {
      this._socket.emit('letter', {letter: i, blue: newValue});
    }
  }

  private componentToHex(c: number): string {
    let hexColor: string = c.toString(16);
    return hexColor.length === 1 ? '0' + hexColor : hexColor;
  }


  private calculateColor(i: number): string {
    return '#' + this.componentToHex(this.letters[i].red) + this.componentToHex(this.letters[i].green) + this.componentToHex(this.letters[i].blue);
  }
}
