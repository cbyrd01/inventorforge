import { NavController, ViewController, NavParams } from 'ionic-angular/index';
import { Component, EventEmitter, Output } from "@angular/core";

/*
  Shows the PopOver page for sign control, to manage general functions
*/
@Component({
  selector: 'sign-popover-page',
  templateUrl: 'build/components/sign-popover-page/sign-popover-page.html'
})
export class SignPopoverPage {

  gearCallback: (_data : any) => void;
  allOnCallback: () => void;
  allOffCallback: () => void;

  private gear : boolean;

  constructor(private nav: NavController, private params: NavParams, private viewCtrl: ViewController) {
    this.gearCallback = this.params.get('gearCallback');
    this.allOnCallback = this.params.get('allOnCallback');
    this.allOffCallback = this.params.get('allOffCallback');
    this.gear = this.params.get('gear');
  }

  gearChanged(gear : boolean) {
    this.gearCallback({"gear": gear});
    this.gear = gear;
    this.close();
  }

  allOn() {
    this.allOnCallback();
    this.close();
  }

  allOff() {
    this.allOffCallback();
    this.close();
  }

  close() {
    this.viewCtrl.dismiss();
  }
}
