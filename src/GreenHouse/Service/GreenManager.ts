import { Application } from '../../Application'
import { AbstractManager } from '../../Base/Service/AbstractManager';
import { IZone } from './GreenHouseModels';
import { ZoneService } from './ZoneService';




export class GreenManager extends AbstractManager {
    public zones: ZoneService[]

    constructor(protected app: Application) {
        super(app)
        this.zones = []
    }

    public async startProcess() {
        const zones: IZone[] = await this.app.greenHouseModels.getFullZonesList([1])
        for (const zone of zones) {
          
            this.zones[zone.id]= new ZoneService(this.app, zone) 
            this.zones[zone.id].startProcess()
        } 
        return Object.keys(this.zones).length
    }

    public stopProcess() {
        this.zones = []
    }

}