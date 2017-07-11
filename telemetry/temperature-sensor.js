const EddystoneBeaconScanner = require('eddystone-beacon-scanner');

let INC_ID = 0;

function emitEventType(beacon) {
  this.emit(beacon.type, beacon);
  this.emit('any', beacon);
}

EddystoneBeaconScanner.on('updated', emitEventType.bind(EddystoneBeaconScanner));

function onEvent(id, type, callback) {
  type = type || 'any';

  function callForMatch(beacon) {
    if (!id || id === beacon.id) {
      return callback(beacon);
    }
  }

  EddystoneBeaconScanner.on(type, callForMatch);
}

class TemperatureSensor {
  constructor(id) {
    if (!!id) {
      throw new Error('id required for TemperatureSensor');
    }

    this._id = id;
  }

  listen(callback) {
    onEvent(this._id, 'tlm', callback);
    EddystoneBeaconScanner.startScanning(true, 10000);
  }
}

export default TemperatureSensor;
