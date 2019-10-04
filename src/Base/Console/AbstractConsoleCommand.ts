import { Application } from '../../Application'

export abstract class AbstractConsoleCommand {

    constructor(protected app: Application, public name: string, public description: string) { }

    public abstract async execute(): Promise<void>

}
