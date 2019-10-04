import path from 'path'
import Express from 'express'
import Multiparty from 'connect-multiparty'
import { DbService } from './Base/Service/DbService'
import { AbstractConsoleCommand } from './Base/Console/AbstractConsoleCommand'
import { GreenHouseModels} from './GreenHouse/Service/GreenHouseModels'
import { GreenManager} from './GreenHouse/Service/GreenManager'
import { GreenHouseController} from './GreenHouse/Controllers/GreenHouseController'
export class Application {
    public mode!: string
    public http!: Express.Express

    /* Commands */
    // public testCommand!: TestCommand

    /* Controllers */
    public greenHouseController!: GreenHouseController

    /* Services */
    public dbService!: DbService
    public greenHouseModels!: GreenHouseModels
    public greenManager!: GreenManager

    constructor(public config: IConfig) {}

    get isConsole() {
        return !!process.argv[2]
    }
    public async run() {
        this.initializeServices()

        if (this.isConsole) {
            this.mode = 'command'
            this.runConsole()
        } else {
            this.mode = 'server'
            this.runWebServer()
        }
    }

    public async runConsole() {
        const command = process.argv[2]
        this.initializeConsoleCommands()
        for (const commandInstance of Object.values(this)) {
            if (commandInstance instanceof AbstractConsoleCommand) {
                if (commandInstance.name === command) {
                    await commandInstance.execute()
                    process.exit()
                }
            }
        }
        console.log(`Command "${command}" not found`)
        process.exit()
    }

    public runWebServer() {
        this.http = Express()
        this.http.use(Express.json())
        this.http.use(Express.urlencoded({ extended: true }))
        this.http.use(Multiparty())
        this.initializeControllers()

        this.http.listen(this.config.port, () => {
            console.log(`Web server started at port ${this.config.port}`)
        })
    }

    public initializeConsoleCommands() {
        // this.testCommand = new TestCommand(this)
    }

    public initializeControllers() {
         this.greenHouseController = new GreenHouseController(this)
    }

    public initializeServices() {
        this.dbService = new DbService(this)
        this.greenHouseModels = new GreenHouseModels(this)
        this.greenManager = new GreenManager(this)

    }

    public get rootDir() {
        return path.dirname(__dirname)
    }

}
