#!/usr/bin/node
var rpio = require('rpio')


//rpio.init({gpiomem: true, mapping: 'physical', mock: undefined})
rpio.open(7, rpio.OUTPUT, rpio.LOW)

console.log('1) Pin 7 = %d', rpio.read(7));
for (var i = 0; i < 5; i++) {
  rpio.write(7, rpio.HIGH);
  rpio.sleep(1);
console.log('2) Pin 7 = %d', rpio.read(7));
  rpio.write(7, rpio.LOW);
  rpio.msleep(500);
}

