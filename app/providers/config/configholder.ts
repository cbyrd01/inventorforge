export class ConfigHolder {
  private _config: any = require("../../../generated/config.json");

  get config():any {
    return this._config;
  }
}
