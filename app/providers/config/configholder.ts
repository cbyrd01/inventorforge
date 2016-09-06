export class ConfigHolder {
  private _config: any = require("../../../config.json");

  get config():any {
    return this._config;
  }
}
