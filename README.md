# greenhouse


Autonomous greenhouse management.
Server + http on Node.js front-end Vue.js. Typescript

The server manages several areas of the greenhouse (for example, dry and wet).
The time, irrigation duration and irrigation period for each zone are set.
Management of valves with de-energized it (configurable).

In each zone, soil moisture is monitored to confirm the fact of irrigation using capacitive soil moisture sensors (up to 4 pcs.) An irrigation log is maintained.
In each zone, humidity and temperature are controlled.

According to the established critical low humidity, moisture is provided by supplying water to the humidification nozzles.
According to the established critically high temperature of the zone, the inclusion of the drive of the ceiling vents and the fan is provided.

The system is powered by a car battery.
Battery life is designed for 5 months.

The system is built on the Raspberry PI3 and available sensors



Автономное управление теплицей. 
Сервер + http на Node.js front-end Vue.js. Typescript. 

Сервер управляет несколькими зонами теплицы ( например сухой и мокрой). 
Устанавливается время, длительность полива и период полива для каждой зоны. 
Управление шаровыми кранами с обесточиванием крана (настраивается). 
В каждой зоне контролируется влажность почвы для подтверждения факта полива по емкостным датчикам влажности почвы (до 4 шт.) Ведётся лог полива. 
В каждой зоне контролиоуется влажность и температура. 
По установленной критическиой низкой влажности предусмотрено увлажнене, путём подачи воды на форсунки увлажнения. 
По установленной критически высокой температуры зоны предусмотрено включение привода потолочных форточки и вентилятора. 

Питание системы осуществляется от автомобильного аккумулятора. 
Автономная работа рассчитана на 5 месяцем.

Система построена на Raspberry PI3 и широкодоступных датчиках