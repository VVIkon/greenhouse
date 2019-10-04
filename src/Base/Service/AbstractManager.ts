import { Application } from '../../Application'

export abstract  class AbstractManager {

    constructor(protected app: Application) {}

    public abstract startProcess(): void
    public abstract stopProcess(): void

}