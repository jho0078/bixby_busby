module.exports.function = function gg_getArrBuslist (results) {


  const console = require("console")
  const http = require("http")
  const fail = require("fail") 
  const ggKey = secret.get('ggKey')
  const apiKey = ggKey
  const baseUrl = 'http://openapi.gbis.go.kr/ws/rest/'


  const originID = results.originID
  let new_results = {"result":[]}
  let result

  let getRequestXml = function (url) {
    let response = http.getUrl(url, {format: 'xmljs', returnHeaders:true})
    if(response.status == 404 || response.parsed.response.msgHeader.resultCode != 0 ){
      checkederror = true
    }else{
      return response
    }
  }

  // 수정 시작
  // 저상버스 확인
  let isLow = function (lowPlate) {
    if (lowPlate == "1") {
      return "/img/wheelchair.png"   
    }
  }

  let getBusNumAndType = function(routeId){
    let url = baseUrl +"busrouteservice/info?serviceKey=" + apiKey + "&routeId=" + routeId
    let response = getRequestXml(url)

    let busInfo = response.parsed.response.msgBody.busRouteInfoItem
    let routeTypeCd = busInfo.routeTypeCd
    result.busNumber = busInfo.routeName

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
    result.busNumber = busInfo.routeName
    result.busImage = "/img/"+ busColor + "-bus.png"
  } 


  let routeTypeCd
  let url = baseUrl + "busarrivalservice/station?serviceKey=" + apiKey + "&stationId=" + originID
  let response = getRequestXml(url)
  if (response) {
    for(let i=0 ; i <  response.parsed.response.msgBody.busArrivalList.length; i++){
      result = {}
      // 수정    
      getBusNumAndType(response.parsed.response.msgBody.busArrivalList[i].routeId)
      let firstArrtime = response.parsed.response.msgBody.busArrivalList[i].predictTime1
      let secondArrtime = response.parsed.response.msgBody.busArrivalList[i].predictTime2
      let firstLocation = response.parsed.response.msgBody.busArrivalList[i].locationNo1
      let secondLocation = response.parsed.response.msgBody.busArrivalList[i].locationNo2
      let firstLow = response.parsed.response.msgBody.busArrivalList[i].lowPlate1
      let secondLow = response.parsed.response.msgBody.busArrivalList[i].lowPlate2

      if(typeof firstArrtime  == "object"){
        result.firstArrtime = "도착정보가 없습니다."
        result.firstLocation = ' '
        result.secondArrtime = "도착정보가 없습니다."
        result.secondLocation = ' '

      }else if(typeof secondArrtime ==  "object"){     
        result.firstArrtime = firstArrtime + "분"
        result.firstLow = isLow(firstLow)
        result.firstLocation = firstLocation + "정거장 전"
        result.secondArrtime = "도착정보가 없습니다."
        result.secondLocation = ' ' 

      }else{
        result.firstArrtime = firstArrtime + "분"
        result.firstLocation = firstLocation + "정거장 전"
        result.firstLow = isLow(firstLow)
        result.secondArrtime = secondArrtime + "분"
        result.secondLocation = secondLocation + "정거장 전"
        result.secondLow = isLow(secondLow)
      }
      new_results.result.push(result)
    }
  } else{
    result = {}
    result.firstArrtime = "운행중인 버스가 없습니다."
    new_results.result.push(result)
  }

  return new_results
}