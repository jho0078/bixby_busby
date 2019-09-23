module.exports.function = function gg (origin, destination, busNumber) {
  origin = origin.replace(/ \./gi,"")
  destination = destination.replace(/ \./gi,"") 

  const ggKey = secret.get('ggKey')
  const apiKey = ggKey
  let baseUrl = 'http://openapi.gbis.go.kr/ws/rest/'

  const console = require("console")
  const http = require("http")
  const fail = require("fail") 

  let results = {"result":[]}  
  results.origin = origin
  results.destination = destination

  let result
  let routeId 
  let stationId  

  let numOfStation
  let checkederror
  let routeTypeCd
  let timeTag

  let busColor
  let find = false

  // 저상버스 확인
  let isLow = function (lowPlate) {
    if (lowPlate == "1") {
      return "/img/wheelchair.png"
    }
  }

  //request and response
  let getRequestXml = function (url) {
    let response = http.getUrl(url, {format: 'xmljs', returnHeaders:true})
    if(response.status == 404 || response.parsed.response.msgHeader.resultCode != 0 ){
      
      checkederror = true
    }else{
      return response
    }
  }


  let getRouteID = function(busNumber){
    let url = baseUrl + 'busrouteservice?serviceKey='+ apiKey +'&keyword='+ busNumber
    let response =  getRequestXml(url)
    if(checkederror == false){
      if (response.parsed.response.msgBody.busRouteList.routeName) {       
        if(response.parsed.response.msgBody.busRouteList.routeName.replace(/\([^()]*\)/,"") == busNumber){          
          routeId = response.parsed.response.msgBody.busRouteList.routeId
          find = getstationID(routeId)
          if(find){
            routeTypeCd = response.parsed.response.msgBody.busRouteList.routeTypeCd     
            if(routeTypeCd == "13"){
              busColor = "green"             
            }else if(routeTypeCd == "12"){
              busColor ="blue"
            }else if(routeTypeCd == "15"){
              busColor = "purple"
            }else if(routeTypeCd == "30"){
              busColor = "yellow"
            }else{
              busColor = "red"
            }
          }
        }
        } else {
        for(let i = 0; i < response.parsed.response.msgBody.busRouteList.length;i++){
          if(response.parsed.response.msgBody.busRouteList[i].routeName.replace(/\([^()]*\)/,"") == busNumber){         
            routeId = response.parsed.response.msgBody.busRouteList[i].routeId
            find = getstationID(routeId)
            if(find){
              routeTypeCd = response.parsed.response.msgBody.busRouteList[i].routeTypeCd     
              if(routeTypeCd == "13"){
                busColor = "green"             
              }else if(routeTypeCd == "12"){
                busColor ="blue"
              }else if(routeTypeCd == "15"){
                busColor = "purple"
              }else if(routeTypeCd == "30"){
                busColor = "yellow"
              }else{
                busColor = "red"
              }            
              break
            }else{
              continue
            }
          }
        }
      }
    }  
  }
  
  // 노선 id로 정류장리스트를 받아온 후 발화와 일치하는 정류소의 id 찾기
  let getstationID = function (routeId) {
    let url = baseUrl + 'busrouteservice/station?serviceKey=' + apiKey + '&routeId=' + routeId
    let requestStopList = getRequestXml(url).parsed.response.msgBody.busRouteStationList

    let startFlag = false
    let endFlag = false
    
    for (let i=0; i<requestStopList.length; i++) {
      if (origin.toLowerCase() == requestStopList[i].stationName.replace(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, "").toLowerCase()) {
        stationId = requestStopList[i].stationId
        startFlag = true
        numOfStation = 1
      } else if(startFlag && destination.toLowerCase() == requestStopList[i].stationName.replace(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, "").toLowerCase()){
        endFlag = true
        break
      } else if(startFlag){
        numOfStation += 1
      }
    }

    if (startFlag == true && endFlag == true) {    

      return true
    } else {
      return false 
    }    
  }


  //도착시간 찾기
  let getarrivetime = function(routeId, stationId){
    let url = baseUrl + 'busarrivalservice?serviceKey=' + apiKey +'&stationId='+stationId+ '&routeId=' + routeId
    let response = getRequestXml(url)
    if (response) {
      let firstArrtime = response.parsed.response.msgBody.busArrivalItem.predictTime1
      let secondArrtime = response.parsed.response.msgBody.busArrivalItem.predictTime2
      let firstLocation = response.parsed.response.msgBody.busArrivalItem.locationNo1
      let secondLocation = response.parsed.response.msgBody.busArrivalItem.locationNo2
      let firstLow = response.parsed.response.msgBody.busArrivalItem.lowPlate1
      let secondLow = response.parsed.response.msgBody.busArrivalItem.lowPlate2
      }

    if(typeof firstArrtime  == "object" || !firstArrtime){
      result.firstArrtime = "도착정보가 없습니다."
      timeTag = 120000
      result.firstLocation = ' '
      result.secondArrtime = "도착정보가 없습니다."
      result.secondLocation = ' '

    }else if(typeof secondArrtime ==  "object" || !secondArrtime){
      result.firstArrtime = firstArrtime + "분"
      timeTag = Number(firstArrtime)
      result.firstLow = isLow(firstLow)
      result.firstLocation = firstLocation + "정거장 전"
      result.secondArrtime = "도착정보가 없습니다."
      result.secondLocation = ' '  

    }else{
      result.firstArrtime = firstArrtime + "분"
      timeTag = Number(firstArrtime)
      result.firstLocation = firstLocation + "정거장 전"
      result.firstLow = isLow(firstLow)
      result.secondArrtime = secondArrtime + "분"
      result.secondLocation = secondLocation + "정거장 전"
      result.secondLow = isLow(secondLow)
    }


    if (firstArrtime == 1)
      result.firstArrtime = "곧 도착"
  }


  //-------------------------------main-------------------------------------------
  //버스의 수 for
  for (let i=0; i<busNumber.length; i++) {
    result = {

    }
    routeTypeCd = ''
    routeId = ''
    stationId = '' 
    checkederror = false
    
    // 수정   
    busNumber[i] = busNumber[i].replace("공", "")  
    
    result.busNumber = busNumber[i]
    
    getRouteID(busNumber[i])
    if(checkederror === true){
      result.errorMsg = busNumber[i]+"는 존재하지 않습니다."
    }else{
      if(find == false){
        result.errorMsg = "해당 정류장에 해당 버스가 없어요.."
      }else{
        result.numOfStation = numOfStation
        getarrivetime(routeId, stationId, result)
        results.originID = stationId
      }
    }

    result.busImage = "/img/"+ busColor + "-bus.png"
    result.timeTag = timeTag
    results.result.push(result)
  } 

  return results
}