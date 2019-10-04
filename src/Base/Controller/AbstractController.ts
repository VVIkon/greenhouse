import { Application } from '../../Application'
import { Request, Response } from 'express'


export class AbstractController {

    constructor(protected app: Application) {}

    public errorResponse(res: Response, errorMessage: string|null) {
        res.send({ error: true, success: false, errorMessage })
    }
    public successResponse(res: Response, data = {}) {
        res.send({ error: false, success: true, ...data })
    }

}
