/**
 * Сервис полива
 * Постулаты:
 * 1. У кжд. сервиса всегда один полив!
 * 
 * Процесс:
 * 1. сравним настоящеее время с временем start
 * 2. включим полив
 * 3. если объект переведён в режим полива, то сравниваем настоящее время start + duration
 * 4. включаем полив
 * 5. увеличиваем дату start на period и сохраняем
 */

import { Application } from '../../Application'
import { AbstractService } from '../../Base/Service/AbstractService'
import { ISetup, ILog } from './GreenHouseModels'
import  rpio  from 'rpio'

export class WateringService extends AbstractService {
    public settings: {[parName: string]: number} = {}
    public status: 'wait'|'wait_process'|'work'|'work_process'
    
    public constructor(protected app: Application, protected zoneId: number) {
        super(app)
        this.status = 'wait'
        this.settings['id'] = zoneId
    }

    public async checkCondition(): Promise<void> {
        this.status = 'wait'
        const sets: ISetup[] = await this.app.greenHouseModels.getSetUp(this.zoneId, ['w'], [1])
        if(sets) {
            for (const element of sets) {
                this.settings[element.parName] = Number(element.parValue)
            }
        }
        if (!this.settings) {
            return 
        }

        console.log(`settings: ${JSON.stringify(this.settings,null,4)}`)
        try {
            
            rpio.init({gpiomem: true, mapping: 'physical'})
            await rpio.open(this.settings.wPinOpen, rpio.OUTPUT, rpio.LOW)
            await rpio.open(this.settings.wPinClose, rpio.OUTPUT, rpio.LOW)
        } catch (error) {
            console.log(`Ошибка инициализации RPIO: ${error}`)            
        }

        let date = new Date()
        let messageDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ` +
        `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')} `
        console.log(`------------- ${messageDate} Старт таймера зоны ${this.settings.id}-----------------`)

        let date2 = new Date(this.settings.wStart * 1000)
        let messageDate2 = `${date2.getFullYear()}-${String(date2.getMonth() + 1).padStart(2, '0')}-${String(date2.getDate()).padStart(2, '0')} ` +
        `${String(date2.getHours()).padStart(2, '0')}:${String(date2.getMinutes()).padStart(2, '0')}:${String(date2.getSeconds()).padStart(2, '0')} `

        console.log(`Первый полив начнётся id=${this.settings.id} ${messageDate2}`)
        this.app.greenHouseModels.setLog({
            id: undefined,
            createdAt: Math.round((new Date).getTime()/1000),
            zoneId: this.settings.id,
            typeOper: 'W',
            controllParam: {duration: 0, next: messageDate2, comment: ''},
            comment: 'Старт системы полива'
        })
        setInterval(async () => {
            date = new Date()
            let currentDateTime = Math.round(date.getTime()/1000)
            let startDateTime = currentDateTime
            messageDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ` +
            `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')} `
            // console.log(`1. Проверка полива полив id=${this.settings.id} ${messageDate}`)
            try {
                // console.log(`1а. Условие id=${this.settings.id} currentDateTime: ${currentDateTime} start: ${this.settings.wStart} status: ${this.status}`)
                if (currentDateTime >= this.settings.wStart && this.status === 'wait')  {
                    console.log(`2. Включился полива полив id=${this.settings.id} ${messageDate}`)
                    this.status = 'work_process'
                    await this.app.greenHouseModels.setLog({
                        id: undefined,
                        createdAt:currentDateTime,
                        zoneId: this.settings.id,
                        typeOper: 'W',
                        controllParam: {duration: this.settings.wDuration, next: '', comment: 'Клапан открыт'},
                        comment: 'Полив включён'
                    })
                    startDateTime = currentDateTime
                    await rpio.write(this.settings.wPinOpen, rpio.HIGH)
                    console.log(`${this.settings.wPinOpen}: ${rpio.read(this.settings.wPinOpen)}`)

                    await new Promise(resolve => setTimeout(() => resolve(), this.settings!.wPinDuration * 1000))
                    await rpio.write(this.settings.wPinOpen, rpio.LOW)
                    this.status = 'work'
                } else if (currentDateTime >= (this.settings.wStart+this.settings.wDuration) && this.status === 'work')  {
                    console.log(`3. Завершение полива полив id=${this.settings.id} ${messageDate}`)
                    this.status = 'wait_process'
                    await rpio.write(this.settings.wPinClose, rpio.HIGH)
                    await rpio.write(this.settings.wPinOpen, rpio.HIGH)
                    await new Promise(resolve => setTimeout(() => resolve(), this.settings!.wPinDuration * 1000))
                    await rpio.write(this.settings.wPinOpen, rpio.LOW)
                    await rpio.write(this.settings.wPinClose, rpio.LOW)
                    
                    this.settings.wStart =  startDateTime + this.settings.wPeriod
                    await this.app.greenHouseModels.setSetup(this.settings.id, 'w', 'wStart', this.settings.wStart)

                    let date2 = new Date(this.settings.wStart * 1000)
                    let messageDate2 = `${date2.getFullYear()}-${String(date2.getMonth() + 1).padStart(2, '0')}-${String(date2.getDate()).padStart(2, '0')} ` +
                    `${String(date2.getHours()).padStart(2, '0')}:${String(date2.getMinutes()).padStart(2, '0')}:${String(date2.getSeconds()).padStart(2, '0')} `
                    console.log(`4. Полив завершён id=${this.settings.id} ${messageDate}`)
                    await this.app.greenHouseModels.setLog({
                        id: undefined,
                        createdAt:currentDateTime,
                        zoneId: this.settings.id,
                        typeOper: 'W',
                        controllParam: {duration: 0, next: messageDate2, comment: 'Клапан закрыт'},
                        comment: 'Полив закончен'
                    })
                    this.status = 'wait'
                }
            } catch (err) {
                console.log(`Ошибка WateringService: ${JSON.stringify(err, null, 4)}`)
            }
        }, this.app.config.controlPeriod * 1000)
    }




}
