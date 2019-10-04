import { Application } from '../../Application'
import { AbstractService } from '../../Base/Service/AbstractService';
import { ISetup } from './GreenHouseModels';
import rpio = require("rpio")
import Exec = require('child_process')


interface ISensorResult{
    temperature: number,
    humidity: number,
    error: string
}

export class TemperatureService extends AbstractService {
    public settings: {[parName: string]: number} = {}
    public status: 'wait'|'wait_process'|'work'|'work_process'

    public constructor(protected app: Application, protected zoneId: number) {
        super(app)
        this.status = 'wait'
        this.settings['id'] = zoneId
    }    




    public getSensResult(): Promise<ISensorResult>{
        return new Promise((resolve, reject) =>{
            const element = `sudo ${this.app.config.sensorPath}Sensors/MMM-HDC1080/ReadHDC1080 ${this.app.config.sensorPIN}`
            // console.log(element)
            Exec.exec(element, (error, stdout) => {
                if (error) {
                    reject({
                        temperature: 0,
                        humidity: 0,
                        error: error
                    })
                }
                const res = stdout.split(",")
                resolve({
                    temperature: parseInt(res[0]),
                    humidity: parseInt(res[1]),
                    error: ''
                })
            })
        })
    }
    public async checkCondition(): Promise<void> {
        const sets: ISetup[] = await this.app.greenHouseModels.getSetUp(this.zoneId, ['t'], [1])
        if(sets) {
            for (const element of sets) {
                this.settings[element.parName] = element.parValue
            }
        }
        if (!this.settings) {
            return 
        }
        await rpio.open(this.settings.tPinOpen,  rpio.OUTPUT,  rpio.LOW)
        await rpio.open(this.settings.tPinClose,  rpio.OUTPUT,  rpio.LOW)        

        console.log(`-------------Слежение за общей температурой и влажностью зоны ${this.settings.id} включено-----------------`)

        setInterval(async () => {
            await this.getSensResult()
                .then( async (out) =>{
                    console.log(`out: ${JSON.stringify(out, null, 4)}`)
                    if (out.error.length === 0 && out.temperature > this.settings!.tOpenTemperature && this.status === 'wait') {
                        this.status = 'work_process'
                        await this.app.greenHouseModels.setLog({
                            id: undefined,
                            createdAt: Math.round((new Date).getTime()/1000),
                            zoneId: this.settings!.id,
                            typeOper: 'T',
                            controllParam: {t: out.temperature, h: out.humidity, comment: `Превышена температура (t > ${this.settings!.tOpenTemperature}) в зоне`},
                            comment: 'Температура выше допустимой'
                        })
                        await rpio.write(this.settings!.tPinOpen, rpio.HIGH)
                        await new Promise(resolve => setTimeout(() => resolve(), this.settings!.tPinDuration * 1000))
                        await rpio.write(this.settings!.tPinOpen, rpio.LOW)
                        this.status = 'work'
                    } else if (out.error.length === 0 && out.temperature < this.settings!.tCloseTemperature && this.status === 'work') {
                        this.status = 'wait_process'
                        await rpio.write(this.settings!.tPinClose, rpio.HIGH)
                        await new Promise(resolve => setTimeout(() => resolve(), this.settings!.tPinDuration * 1000))
                        await rpio.write(this.settings!.tPinClose, rpio.LOW)
                        await this.app.greenHouseModels.setLog({
                            id: undefined,
                            createdAt: Math.round((new Date).getTime()/1000),
                            zoneId: this.settings!.id,
                            typeOper: 'T',
                            controllParam: {t: out.temperature, h: out.humidity, comment: `Температура в зоне меньше допустимой (${this.settings!.tOpenTemperature})`},
                            comment: 'Температура ниже допустимой'
                        })

                        this.status = 'wait'
                    }    
                }).catch(err =>{
                    console.log(`Ошибка TemperatureService: ${JSON.stringify(err, null, 4)}`)
                })
        }, this.app.config.controlPeriod * 1000)

    }


    // public async am2320(): Promise<Buffer|undefined> {
    //     // const txbuf = new Buffer([0x0b, 0x0e, 0x0e, 0x0f])
    //     const txbuf = new Buffer([0x08b, 0x03, 0x00, 0x04])
    //     const rxbuf = new Buffer(32)
    //     try {
    //         // rpio.pud(3, rpio.PULL_UP)
    //         // rpio.pud(5, rpio.PULL_UP)
    //         await rpio.init({gpiomem: false})
    //         await rpio.i2cBegin()
    //         await rpio.i2cSetSlaveAddress(0x40)
    //         await rpio.i2cSetClockDivider(2500) // Делитель 148 = 1.689 Мгц | 150 = 1,666 МГц (по умолчанию при сбросе) | 622 = 399,3610 кГц | 2500 = 100 кГц
    
    //         await rpio.i2cWrite(txbuf)           /* Sends 4 bytes */
    //         await rpio.i2cRead(rxbuf)        /* Reads 16 bytes */
    //         await rpio.i2cEnd()
    //         await rpio.init({gpiomem: true})
    //         return rxbuf
    //     } catch (error) {
    //         console.log(`Ошибка2: ${error}`)   
    //         return undefined         
    //     }
    // }

    // public getTermo(){

    //      pin = 7;

    //     var data = new Array(40);
    //     var buf = new Buffer(100000);
    //     var i;
        
    //     /*
    //     * Initiate the MCU sequence.
    //     */
        
    //     rpio.open(pin, rpio.OUTPUT);
    //     rpio.write(pin, rpio.HIGH);
    //     rpio.msleep(500);
    //     rpio.write(pin, rpio.LOW);

    //     /*
    //     * The datasheet says 18us, but we need to account for the JavaScript function
    //     * call overhead.  Trial and error suggests this is a working value.
    //     */
    //     rpio.msleep(3);
    //     rpio.write(pin, rpio.HIGH);

    //     /*
    //     * Switch to input mode and read as fast as possible into our buffer.
    //     */
    //     rpio.mode(pin, rpio.INPUT);
    //     rpio.readbuf(pin, buf);

    //     /*
    //     * Parse the buffer for lengths of each high section.  The length determines
    //     * whether it's a low, high, or control bit.
    //     */
    //     var tmp = new Array(buf.length); /* 0.8 compat */
    //     for (i = 0; i < buf.length; i++) {
    //         /* Convert buffer to array for node.js 0.8 compat */
    //         tmp[i] = buf[i];
    //     }

    //     i = 0;
    //     tmp.join('').replace(/0+/g, '0').split('0').forEach(function(bits) {
    //         /*
    //         * These are magic numbers.  If they don't work then uncomment this
    //         * line instead, it should give you the rough numbers required to
    //         * differentiate 0's and 1's.
    //         *
    //         * console.log(bits.length);
    //         */
    //         if (bits.length > 320)
    //             return;
    //         data[i++] = (bits.length > 150) ? 1 : 0;
    //     });

    //     var rh_int = parseInt(data.slice(0, 8).join(''), 2);
    //     var rh_dec = parseInt(data.slice(8, 16).join(''), 2);
    //     var tm_int = parseInt(data.slice(16, 24).join(''), 2);
    //     var tm_dec = parseInt(data.slice(24, 32).join(''), 2);
    //     var chksum = parseInt(data.slice(32, 40).join(''), 2);

    //     /* chksum should match this calculation */
    //     var chk = ((rh_int + rh_dec + tm_int + tm_dec) & 0xFF);

    //     /* Sometimes the checksum will be correct but the values obviously wrong. */
    //     if (chksum == chk && rh_int <= 100) {
    //         console.log("Temperature = %dC, Humidity = %d%%", tm_int, rh_int);
    //     } else {
    //         console.log("Read failed:");
    //         console.log("    chk = %d, chksum = %d", chk, chksum);
    //         console.log("    %d %d %d %d (%d = %d)", rh_int, rh_dec, tm_int, tm_dec, chk, chksum);
    //     }

    // } 
}
