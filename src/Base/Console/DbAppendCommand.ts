import { AbstractConsoleCommand } from './AbstractConsoleCommand'
import { Application } from '../../Application'

export class DbAppendCommand extends AbstractConsoleCommand {

    constructor(app: Application) {
        super(app, 'db:append', 'Добавляет в БД новые таблицы')
    }

    public async execute() {
        await this.app.dbService.onDbConnected()
        this.app.dbService.sequelize.sync()
    }

}
