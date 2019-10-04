import { Application } from '../../Application'
import { IZone } from './GreenHouseModels';
import { WateringService } from './WateringService';
import { HumidityService } from './HumidityService';
import { TemperatureService } from './TemperatureService';

export class ZoneService{
    private wateringService: WateringService|undefined = undefined
    private humidityService: HumidityService|undefined = undefined
    private temperatureService: TemperatureService|undefined = undefined

    constructor(protected app: Application, protected zone: IZone) { }    

    public startProcess() {
        try {
            this.wateringService = new WateringService(this.app, this.zone.id)
            this.wateringService.checkCondition()

            // this.humidityService = new HumidityService(this.app, this.zone.id)
            // this.humidityService.checkCondition()

            //  this.temperatureService = new TemperatureService(this.app, this.zone.id)
            //  this.temperatureService.checkCondition()
        } catch (error) {
            console.log(`Ошибка очереди зон: ${error}`)
        }
    }
}
