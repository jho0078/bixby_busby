module.exports.function = function getArrBuslist_seoul (results) {
  let busColorSet = {
    '1':'skyblue',
    '2':'green',
    '3':'blue',
    '4':'green',
    '5':'yellow',
    '6':'red',
    '7':'grey',
    '8':'ok',
    '9':'grey',
    '0':'grey'
  }

  let busImageSet = {
    '1':"/img/skyblue-bus.png",
    '2':"/img/green-bus.png",
    '3':"/img/blue-bus.png",
    '4':"/img/green-bus.png",
    '5':"/img/yellow-bus.png",
    '6':"/img/red-bus.png",
    '7':"/img/grey-bus.png",
    '8':"/img/ok-bus.png",
    '9':"/img/grey-bus.png",
    '0':"/img/grey-bus.png"
  }
  const console = require("console")
  const http = require("http")
  const fail = require("fail")
  const originID = results.originID
  const seoulKey = secret.get('seoulKey')
  const apiKey = seoulKey
  const baseUrl = 'http://ws.bus.go.kr/api/rest/'


  let results = {"result":[]}
  let result

  let getRequestXml = function (url) {
    let response = http.getUrl(url, {format: 'xmljs', returnHeaders:true})
    if(response.status == 404 || response.parsed.ServiceResult.msgHeader.headerCd != 0 ){
      checkederror = true
    }else{
      return response.parsed
    }
  }

  // 수정 시작
  let isLow = function (lowPlate) {
    if (lowPlate == "1")
      return '/img/wheelchair.png'
  }

  let min = function(time){
    if (time){
      var remain = parseInt(time/60)
      if (remain){
        return remain + "분"
      } else {
        return "곧 도착"
      }
    }
    return "도착정보가 없습니다."
  }


  let routeTypeCd
  let url = baseUrl + "stationinfo/getStationByUid?serviceKey=" + apiKey + "&arsId=" + originID
  let response = getRequestXml(url).ServiceResult.msgBody

  let getResult = function (arrInfo) {
    let nowL = parseInt(arrInfo.staOrd)
    let numOfStation = parseInt(arrInfo.staOrd)-nowL
    let bus = {
      busNumber : arrInfo.rtNm,
      timeTag: parseInt(arrInfo.traTime1)? parseInt(arrInfo.traTime1):999999999,
      firstArrtime : min(parseInt(arrInfo.traTime1)),
      secondArrtime : min(parseInt(arrInfo.traTime2)),
      firstLocation: parseInt(arrInfo.traTime1)? nowL-parseInt(arrInfo.sectOrd1) + "정거장 전":" ",
      secondLocation: parseInt(arrInfo.traTime2)? nowL-parseInt(arrInfo.sectOrd2) + "정거장 전":" ",
      firstLow: isLow(arrInfo.busType1),
      secondLow: isLow(arrInfo.busType2),
      busColor: busColorSet[arrInfo.routeType],
      busImage: busImageSet[arrInfo.routeType],
      timeTag: parseInt(arrInfo.traTime1)
    }
    return bus
  }

  let checkResult = function (busResult) {
    let newResult = busResult
    if (!busResult.firstLocation) {
      newResult.firstArrtime = "도착정보가 없습니다."
      newResult.firstLocation = ' '
      newResult.secondArrtime = "도착정보가 없습니다."
      newResult.secondLocation = ' '
    } else if (!busResult.secondLocation) {
      newResult.secondArrtime = "도착정보가 없습니다."
      newResult.secondLocation = ' ' 
    }
    return newResult
  }


  if(response.itemList.arsId){
    let arrInfo = response.itemList
    let busResult = getResult(arrInfo)
    let newResult = checkResult(busResult)
    results.result.push(newResult)
  } else {
    for (let i=0; i<response.itemList.length; i++) {
      let arrInfo = response.itemList[i]
      let busResult = getResult(arrInfo)
      let newResult = checkResult(busResult)
      results.result.push(newResult)
    }
  }
  return results
}