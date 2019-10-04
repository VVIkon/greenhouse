import { Application } from '../../Application'
import { AbstractService } from '../../Base/Service/AbstractService'
import { ISetup } from './GreenHouseModels'
import rpio = require('rpio')


export class HumidityService extends AbstractService {
    public settings: {[parName: string]: number} = {}
    public status: 'wait'|'work'



    constructor(protected app: Application, protected zoneId: number) {
        super(app)
        this.status = 'wait'
        this.settings['id'] = zoneId
    }    

    public async checkCondition(): Promise<void> {
        const sets: ISetup[] = await this.app.greenHouseModels.getSetUp(this.zoneId, ['h'], [1])
        if(sets) {
            for (const element of sets) {
                this.settings[element.parName] = element.parValue
            }
        }
        if (!this.settings) {
            return 
        }
        rpio.open(this.settings.pinHumidity, rpio.OUTPUT, rpio.LOW)
        setInterval(async () => {
            // Todo: здесь нужно получить величину влажности от I2C
            rpio.write(this.settings.hPinHumidity, rpio.HIGH)
            await new Promise(resolve => setTimeout(() => resolve(), this.settings.durationHumidity * 1000))
            rpio.write(this.settings.hPinHumidity, rpio.LOW)
        }, this.app.config.controlPeriod * 1000)
    }
}
