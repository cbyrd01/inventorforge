import {Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import {NavController, PopoverController} from 'ionic-angular';
import {Slides} from 'ionic-angular';
import {waitRendered} from './util';
import {Letter} from '../../models/letter.interface';
import {ConfigHolder} from '../../providers/config/configholder';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import * as io from 'socket.io-client';
import {SignPopoverPage} from '../../components/sign-popover-page/sign-popover-page';


@Component({
  templateUrl: 'build/pages/sign/sign.html'
})
export class SignPage {

  private _socket: any;
  private _config: any;

  redControl   = new FormControl();
  greenControl = new FormControl();
  blueControl  = new FormControl();

  gear : boolean = false;

  @ViewChild('letterSlider') letterSlider: Slides;

  public letters: Letter[] = [
    {label: 'F', red: 0, green: 0, blue: 0, bgcolor: '#000000'},
    {label: 'O', red: 0, green: 0, blue: 0, bgcolor: '#000000'},
    {label: 'R', red: 0, green: 0, blue: 0, bgcolor: '#000000'},
    {label: 'G', red: 0, green: 0, blue: 0, bgcolor: '#000000'},
    {label: 'E', red: 0, green: 0, blue: 0, bgcolor: '#000000'}
  ];



  constructor(private navController: NavController, private _elementRef: ElementRef, private configHolder : ConfigHolder, private popoverCtrl: PopoverController) {
    this._config = configHolder.config;

    let serverUrl = 'http://localhost:8080'; // Default
    if(typeof this._config["client"] != "undefined" &&
      typeof this._config["client"]["socketUrl"] != "undefined") {
      serverUrl = this._config["client"]["socketUrl"];
    }
    
    this._socket = io.connect(serverUrl);

    this._socket.on("gear", (msg) => {
      console.log("received gear message");
      if(msg.gear != undefined) {
        this.setGear(msg.gear, false);
      }
    });

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

  presentPopover(myEvent) {
    console.log("popover start " + this.gear);
    let popover = this.popoverCtrl.create(SignPopoverPage, {
      gearCallback: function(_data) {
        this.setGear(_data["gear"]);
        console.log("New gear value: " + this.gear);
      }.bind(this),
      allOnCallback: function() {
        this.setAllOn();
        console.log("all on!");
      }.bind(this),
      allOffCallback: function() {
        this.setAllOff();
        console.log("all off!");
      }.bind(this),
      gear: this.gear
    });
    popover.present({
      ev: myEvent
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

  public ngAfterViewInit() {
    // Use debounce to reduce the number of values sent
    this.redControl.valueChanges.debounceTime(this._config["client"]["debounce"])
    .subscribe(newValue => {
      console.log("Red set to " + newValue + " on " + this.letterSlider.getActiveIndex());
      this.setRed(newValue, this.letterSlider.getActiveIndex());
    });
    this.greenControl.valueChanges.debounceTime(this._config["client"]["debounce"])
    .subscribe(newValue => {
      console.log("Green set to " + newValue + " on " + this.letterSlider.getActiveIndex());
      this.setGreen(newValue, this.letterSlider.getActiveIndex());
    });
    this.blueControl.valueChanges.debounceTime(this._config["client"]["debounce"])
    .subscribe(newValue => {
      console.log("Blue set to " + newValue + " on " + this.letterSlider.getActiveIndex());
      this.setBlue(newValue, this.letterSlider.getActiveIndex());
    });

  }

  public nextSlide() {
    this.letterSlider.slideNext();
  }

  public prevSlide() {
    this.letterSlider.slidePrev();
  }

  public setGear(newValue: boolean, update: boolean = true) {
    this.gear = newValue;
    if(update) {
      this._socket.emit('gear', {gear: newValue});
    }
  }

  public setAllOn(update: boolean = true) {
    for(let i=0;i<this.letterSlider.length();i++) {
      this.setRed(255, i, false);
      this.setGreen(255, i, false);
      this.setBlue(255, i, false);
    }
    if(update) {
      this._socket.emit('allon', {});
    }
  }

  public setAllOff(update: boolean = true) {
    for(let i=0;i<this.letterSlider.length();i++) {
      this.setRed(0, i, false);
      this.setGreen(0, i, false);
      this.setBlue(0, i, false);
    }
    if(update) {
      this._socket.emit('alloff', {});
    }
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
