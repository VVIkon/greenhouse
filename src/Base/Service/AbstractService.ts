import { Application } from '../../Application'

export abstract class AbstractService {

    constructor(protected app: Application) {}

    protected abstract checkCondition(): void 

}