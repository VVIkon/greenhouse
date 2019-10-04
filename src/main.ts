import { Application } from './Application'
import routines from './routines'
// import Crypto from 'crypto'

export function execute(config: IConfig) {
    // String.prototype.sha512 = function() {
    //     return Crypto.createHash('sha512').update(this as string).digest('hex').toString()
    // }
    // String.prototype.md5 = function() {
    //     return Crypto.createHash('md5').update(this as string).digest('hex').toString()
    // }
    // String.prototype.isValidEmail = function() {
    //     return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(this as string)
    // }
    Date.prototype.getTimestamp = function() { return Math.floor(this.getTime() / 1000) }
    ; (global as any).time = () => Math.floor(Date.now() / 1000)
    ; (global as any).date = (format: string, timestamp: number) => routines.date(format, timestamp)
    ; (global as any).float = (value: any) => value ? parseFloat(value) : .0

    const app = new Application(config)
    app.run()
}
