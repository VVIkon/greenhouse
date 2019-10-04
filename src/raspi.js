#!/usr/bin/node

const raspi = require('raspi')
const gpio = require('raspi-gpio')

raspi.init( async () => {
  const output = new gpio.DigitalOutput('P1-7')
  output.write(gpio.LOW)
  output.on('change', value => {
    console.log(`val: ${value}`)
  })

  output.write(gpio.HIGH)
  await new Promise(resolve => setTimeout(() => resolve(), 3000))
  output.write(gpio.LOW)

});

