import { Application } from '../../Application'
import { AbstractController } from '../../Base/Controller/AbstractController'
import { Request, Response } from 'express'
import { IZone } from '../Service/GreenHouseModels'

export class GreenHouseController extends AbstractController {

    constructor(app: Application) {
        super(app)
        app.http.get('/zones/list', (req, res) => this.getFullZoneList(req, res))
        app.http.get('/zones/start', (req, res) => this.zoneWatch(req, res))
    }

    public async getFullZoneList(req: Request, res: Response) {
        const result: IZone[] = await this.app.greenHouseModels.getFullZonesList([1,2])
        if (result) {
            return this.successResponse(res, { result: result })
        } else {
            return this.errorResponse(res, 'Нет данных')
        }
    }

    public async zoneWatch(req: Request, res: Response) {
        const retVal = await this.app.greenManager.startProcess()
        return this.successResponse(res, { result: retVal })
    } 

}