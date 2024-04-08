
//地區類別
export class Location{
    constructor(city,town,reqestType){
        this.city = city,
        this.town = town
        this.reqestType = reqestType
        this.replaceTown = null;
    }
    show(){
        console.log(this.city,this.town)
    }

    async checkhaveStation(){
        const noStationLocation = await fetch('./jsonFolder/noStationLocation.json')
        const res_noStation = await noStationLocation.json()
        const queryNoStationCity = res_noStation.location.find(item =>item.city === this.city)
        let queryNoStationTown;
        if(queryNoStationCity!=undefined){
            queryNoStationTown = queryNoStationCity.town.find(item =>item.originTown === this.town)

            if(queryNoStationTown!=undefined){
                this.replaceTown = queryNoStationTown.replaceTown
            }
        }    
        return null
    }
}


//氣象類別
export class WeatherAPI{

    //後端伺服器API
    static _apiBaseUrl =import.meta.env.VITE_API_URL //'http://127.0.0.1:3000/api/v1'

    static getAPIBaseUrl(){
        return WeatherAPI._apiBaseUrl
    }

    static async fetchWeatherData(location,apiName){
        const city = location.city
        let town = location.town
        const type = location.reqestType
        let apiType = ''
        let apiUrl = ''

        if(apiName!=='weatherCurrent'){
            if(type){
                apiType = 'cities'
            }else{
                apiType = 'towns'            
            }
            apiUrl =`${WeatherAPI.getAPIBaseUrl()}/${apiName}/${apiType}?cityName=${city}&townName=${town}`
            console.log(apiUrl)
        }else{  
            let queryType;            
            if(type){
                queryType='CITY'
            }else{
                queryType='TOWN'

                if(location.replaceTown!=null){
                    town = location.replaceTown
                }

            }
            apiUrl =`${WeatherAPI.getAPIBaseUrl()}/${apiName}?cityName=${city}&townName=${town}&queryType=${queryType}`            
        }

        const fetchData = await fetch(apiUrl)
        const response = await fetchData.json()
        console.log(response)
        return response
    }
}


