declare interface String {
    sha512(): string
    md5(): string
    isValidEmail(): boolean
}
declare interface Date {
    getTimestamp(): number
}
declare function time(): number
declare function date(format: string, timestamp: number): string
declare function float(value: any): number

declare interface IConfig {
    port: number
    db: {
        name: string
        user: string
        password: string
    },
    storage: string
    node_env: string
    controlPeriod: number
    sensorPIN: number
    sensorPath: string
}

declare module "connect-multiparty" {
    const app: any

    export default app
}
