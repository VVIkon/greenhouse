import { Application } from '../../Application'
import DataTypes from 'sequelize'
import { AbstractModel } from '../../Base/Service/AbstractModel';

export interface IZone{
    id: number
    title: string
    active: number
}
export interface ISetup {
    id: number,
    zoneId: number,
    grp: string,
    parName: string
    parValue: number,
    parComment: string,
    active:number

}
export interface ILog {
    id: number|undefined
    createdAt: number
    zoneId: number
    typeOper: string
    controllParam: {t: number, h: number, comment: string} | {duration: number, next: string, comment: string} | {hg: number, comment: string}
    comment: string
}

export class GreenHouseModels extends AbstractModel{
    public zoneModel: any
    public logModel: any
    public setupModel: any

    constructor(protected app: Application) {
        super(app)

        this.zoneModel = app.dbService.sequelize.define('zones', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: DataTypes.STRING(128),
                allowNull: false,
            },
            active: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        })
        this.setupModel = app.dbService.sequelize.define('setup', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            zoneId:{
                type: DataTypes.INTEGER(),
                field: 'zone_id',
                allowNull: false,
                references: { model: 'zones', key: 'id' }
            },
            grp: {
                type: DataTypes.STRING(2),
                field: 'grp',
                allowNull: false,
            },
            parName: {
                type: DataTypes.STRING(150),
                field: 'par_name',
                allowNull: false,
            },
            parValue: {
                type: DataTypes.STRING(50),
                field: 'par_value',
                allowNull: false,
            },
            parComment: {
                type: DataTypes.STRING(250),
                field: 'par_comment',
                allowNull: false,
            },
            active: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            createdAt: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        }, {tableName: 'setup', createdAt: 'createdAt', updatedAt: 'updatedAt',  timestamps: true,})
        this.logModel = app.dbService.sequelize.define('log', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            createdAt: {
                type: DataTypes.INTEGER,
                field: 'create_at',
                allowNull: false,
            },
            zoneId:{
                type: DataTypes.INTEGER(),
                field: 'zone_id',
                allowNull: false,
                references: { model: 'zones', key: 'id' }
            },
            typeOper: {
                type: DataTypes.STRING(2),
                field: 'type_oper',
                allowNull: false,
                comment: 'тип операции: W-полив, T-температура и влажность зоны, H - контроль влажности почвы'
            },
            controllParam: {
                type: DataTypes.STRING(255),
                field: 'controll_param',
                allowNull: false,
                comment: 'Контролируемые параметры: {t: 28, h:45} или {ws: "полив включен", duration: 35, next: "2019-07-21 06:59:22"}'
            },
            comment: {
                type: DataTypes.STRING(255),
                field: 'comment',
                allowNull: false,
                comment: 'Старт полива'
            },
            updatedAt: {
                type: DataTypes.INTEGER,
                field: 'updated_at',
                allowNull: false,
            },

        })
    }    


/** ---------------------------------GET/SET--------------------------------------- */

    /**
     * Настройки
     */
    public async getFullZonesList (all: number[]=[0,1]): Promise<IZone[]>{
        return this.zoneModel.findAll({
            where: {
                active: {[DataTypes.Op.in]: all }
            },
            order: [
                ['id', 'ASC']
            ]
        })
    }
    public async getActiveZones (all: number[]=[1]): Promise<IZone[]>{
        return this.zoneModel.findAll({
            where: {
                active: {[DataTypes.Op.in]: all }
            },
            order: [
                ['id', 'ASC']
            ]
        })
    }
    public async getZone(id: number): Promise<IZone> {
        return this.zoneModel.findOne({ where: { id } })
    }

    public async setZone(params: IZone): Promise<IZone> {
        let result = null
        if (params.id) {
            try {
                let foundZone = await this.zoneModel.findById(params.id)
                if (foundZone) {
                    foundZone = params
                    result = await foundZone.save()
                }
            } catch (err) {
                console.log('Ошибка: ' + err, params.toString())
            }
        } else {
            try {
                result = await this.zoneModel.create({ params})
            } catch (err) {
                console.log('Ошибка: ' + err, params.toString())
            }
        }
        return result.dataValues
    }
    /** -----------------------------------------Watering ----------------------------------- */
    // public async getWatering(zoneId: number, active: number[] = [0,1]): Promise<IWatering[]> {
    //     return await this.wateringModel.findAll({ where: { zoneId, active } })
    // }
    // public async getWateringOne(zoneId: number, active: number[] = [0,1]): Promise<IWatering> {
    //     return await this.wateringModel.findOne({ where: { zoneId, active }, order: [['id', 'ASC']] })
    // }

    // public async setWatering(params: IWatering): Promise<IWatering> {
    //     let result = null
    //     if (params.id) {
    //         try {
    //             let foundWatering = await this.wateringModel.findByPk(params.id)
    //             if (foundWatering) {
    //                 foundWatering.zoneId = params.zoneId
    //                 foundWatering.start = params.start
    //                 foundWatering.duration = params.duration
    //                 foundWatering.period = params.period
    //                 foundWatering.pinOpen = params.pinOpen
    //                 foundWatering.pinClose = params.pinClose
    //                 foundWatering.pinDuration = params.pinDuration
    //                 foundWatering.active = params.active
    //                 result = await foundWatering.save()
    //             }
    //         } catch (err) {
    //             console.log('Ошибка: ' + err, params.toString())
    //         }
    //     } else {
    //         try {
    //             result = await this.wateringModel.create({ params})
    //         } catch (err) {
    //             console.log('Ошибка: ' + err, params.toString())
    //         }
    //     }
    //     return result.dataValues
    // }

    /** -----------------------------------------Humidity ----------------------------------- */

    // public async getHumidity(zoneId: number, active: number[]=[0,1]): Promise<IHumidity[]> {
    //     return await this.humidityModel.findAll({ where: { zoneId, active } })
    // }

    // public async getHumidityOne(zoneId: number, active: number[]=[0,1]): Promise<IHumidity> {
    //     return await this.humidityModel.findOne({ where: { zoneId, active }, order: [['id', 'ASC']]  })
    // }

    // public async setHumidity(params: IHumidity): Promise<IHumidity> {
    //     let result = null
    //     if (params.id) {
    //         try {
    //             let foundHumidity = await this.humidityModel.findById(params.id)
    //             if (foundHumidity) {
    //                 foundHumidity = params
    //                 result = await foundHumidity.save()
    //             }
    //         } catch (err) {
    //             console.log('Ошибка: ' + err, params.toString())
    //         }
    //     } else {
    //         try {
    //             result = await this.humidityModel.create({ params})
    //         } catch (err) {
    //             console.log('Ошибка: ' + err, params.toString())
    //         }
    //     }
    //     return result.dataValues
    // }

    /** -----------------------------------------Temperature ----------------------------------- */
    // public async getTemperature(zoneId: number, active: number[]=[0,1]): Promise<ITemperature[]> {
    //     return await this.temperatureModel.findAll({ where: { zoneId, active } })
    // }
    // public async getTemperatureOne(zoneId: number, active: number[]=[0,1]): Promise<ITemperature> {
    //     return await this.temperatureModel.findOne({ where: { zoneId, active }, order: [['id', 'ASC']]  })
    // }


    // public async setTemperature(params: ITemperature): Promise<ITemperature> {
    //     let result = null
    //     if (params.id) {
    //         try {
    //             let foundTemperature = await this.temperatureModel.findById(params.id)
    //             if (foundTemperature) {
    //                 foundTemperature = params
    //                 result = await foundTemperature.save()
    //             }
    //         } catch (err) {
    //             console.log('Ошибка: ' + err, params.toString())
    //         }
    //     } else {
    //         try {
    //             result = await this.temperatureModel.create({ params})
    //         } catch (err) {
    //             console.log('Ошибка: ' + err, params.toString())
    //         }
    //     }
    //     return result.dataValues
    // }

    
    /** -----------------------------------------SetUp ----------------------------------- */
    public async getSetUp(zoneId: number, groups: string[] = ['w', 't', 'h'], active: number[] = [1]): Promise<ISetup[]> {
        return await this.setupModel.findAll({ 
            where: {
                zoneId,
                grp: {[DataTypes.Op.in]: groups },
                active: {[DataTypes.Op.in]: active }
            },
            order: [
                ['createdAt', 'ASC']
            ]})
    }
    public async setSetup(zoneId: number, grp: string, parName: string, parValue: number): Promise<ISetup> {
        let result = null
        try {
            let setup = await this.setupModel.findByPk(zoneId)
            if (setup) {
                setup.parValue = parValue
                result = await setup.save()
            } else {
                result = await this.setupModel.create({ 
                    zoneId: zoneId, 
                    grp: grp, 
                    parName: parName, 
                    parValue: parValue,
                    parComment: 'Новый параметр. Добавить описание',
                    active: 1
                })
            }

        } catch (err) {
            console.log('Ошибка: ' + err)
        }
        return result.dataValues
    }
    
    /** ----------------------------------------- Log ----------------------------------- */
        public async getLog(zone: number[]=[1,2], typeOper:string[]= ['W','T','H'], active: number[]=[1]): Promise<ILog[]> {
            return await this.logModel.findAll({ 
                where: {
                    zone_id: {[DataTypes.Op.in]: zone },
                    type_oper: {[DataTypes.Op.in]: typeOper },
                    active: {[DataTypes.Op.in]: active }
                },
                order: [
                    ['create_at', 'ASC']
                ]})
        }
    public async setLog(params: ILog): Promise<ILog|undefined> {
        let result = null

        if (params.id) {
            try {
                let foundLog = await this.logModel.findByPK(params.id)
                if (foundLog) {
                    foundLog.createdAt = params.createdAt
                    foundLog.zoneId = params.zoneId
                    foundLog.typeOper = params.typeOper
                    foundLog.controllParam = params.controllParam
                    foundLog.comment = params.comment
                    result = await foundLog.save()
                }
            } catch (err) {
                console.log('Ошибка: ' + err, params.toString())
            }
        } else {
            try {
                result = await this.logModel.create({ 
                    createdAt: params.createdAt,
                    zoneId: params.zoneId,
                    typeOper: params.typeOper,
                    controllParam: JSON.stringify(params.controllParam),
                    comment: params.comment
                })
            } catch (err) {
                console.log('Ошибка: ' + err, params.toString())
            }
        }
        return result ? result.dataValues : undefined
    }



}    



// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(1, 'w','start', '1563728534', 'Начало полива', 1, 1562173333, 1562173333);
// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(2, 'w','start', '1563728514', 'Начало полива', 1, 1562173333, 1562173333);

// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(1, 'w','wDuration', '20', 'Продолжительность полива (sec)', 1, 1562173333, 1562173333);
// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(2, 'w','wDuration', '35', 'Продолжительность полива (sec)', 1, 1562173333, 1562173333);

// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(1, 'w','period', '35', 'Период полива', 1, 1562173333, 1562173333);
// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(2, 'w','period', '35', 'Период полива', 1, 1562173333, 1562173333);

// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(1, 'w','pinOpen', '7', 'GPIO контакт включения полива', 1, 1562173333, 1562173333);
// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(2, 'w','pinOpen', '12', 'GPIO контакт включения полива', 1, 1562173333, 1562173333);

// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(1, 'w','pinClose', '11', 'GPIO контакт выключения полива', 1, 1562173333, 1562173333);
// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(2, '`','pinClose', '15', 'GPIO контакт выключения полива', 1, 1562173333, 1562173333);

// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(1, 'w','pinDupatuon', '10', 'Длительность подачи тока (сек)', 1, 1562173333, 1562173333);
// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(2, 'w','pinDupatuon', '10', 'Длительность подачи тока (сек)', 1, 1562173333, 1562173333);

// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(1, 't','tOpen', '28', 'Температура открытия форточки', 1, 1562173333, 1562173333);
// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(2, 't','tOpen', '26', 'Температура открытия форточки', 1, 1562173333, 1562173333);

// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(1, 't','tClose', '21', 'Температура закрытия форточки', 1, 1562173333, 1562173333);
// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(2, 't','tClose', '21', 'Температура закрытия форточки', 1, 1562173333, 1562173333);

// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(1, 't','pinOpen', '29', 'GPIO контакт открытия форточки', 1, 1562173333, 1562173333);
// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(2, 't','pinOpen', '33', 'GPIO контакт открытия форточки', 1, 1562173333, 1562173333);

// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(1, 't','pinClose', '31', 'GPIO контакт закрытия форточки', 1, 1562173333, 1562173333);
// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(2, 't','pinClose', '35', 'GPIO контакт закрытия форточки', 1, 1562173333, 1562173333);

// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(1, 't','pinDupatuon', '10', 'Длительность подачи тока (сек)', 1, 1562173333, 1562173333);
// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(2, 't','pinDupatuon', '10', 'Длительность подачи тока (сек)', 1, 1562173333, 1562173333);

// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(1, 'h','hOpen', '28', 'Минимальная Влажность включения насоса', 1, 1562173333, 1562173333);
// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(2, 'h','hOpen', '26', 'Минимальная Влажность включения насоса', 1, 1562173333, 1562173333);

// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(1, 'h','pinOpenClose', '12', 'GPIO контакт включения полива', 1, 1562173333, 1562173333);
// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(2, 'h','pinOpenClose', '16', 'GPIO контакт включения полива', 1, 1562173333, 1562173333);

// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(1, 'h','hDupatuon', '10', 'Длительность увлажнения (сек)', 1, 1562173333, 1562173333);
// INSERT INTO setup(zone_id, grp, par_name, par_value, par_comment, active, createdAt, updatedAt) VALUES(2, 'h','hDupatuon', '10', 'Длительность увлажнения (сек)', 1, 1562173333, 1562173333);




