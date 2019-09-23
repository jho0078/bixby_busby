var http = require('http')
var console = require('console')
const seoulKey = secret.get('seoulKey')
var key = seoulKey
var url = 'http://ws.bus.go.kr/api/rest/'
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

module.exports.function = function seoul (origin, destination, busNumber, lowTag) {
  origin = origin.replace(/ /gi,"")
  destination = destination.replace(/ /gi,"")
  var firstT, secondT, firstL, secondL, originId, firstLow, secondLow, timeTag
  var errorMsg = false
  var results = {"result":[],}
  var minTag = false
  var numOfStation

  // 분 변환하는 함수
  let min = function(time){
    if (time){
      var remain = parseInt(time/60)
      timeTag =  parseInt(time)
      if (remain){
        minTag = true
        return remain + "분"
      } else {
        minTag = false
        return "곧 도착"
      }
    } 
    minTag = false
    timeTag = 999999
    return "도착정보가 없습니다."
  }

  //도착 시간, 정류장 찾는 함수
  let arrTime = function (busRouteId, origin, destination) {
    var routeList = http.getUrl( url + 'arrive/getArrInfoByRouteAll?ServiceKey=' 
                                + key + '&busRouteId=' + busRouteId, 
                                {format: 'xmljs'}).ServiceResult.msgBody.itemList

    var Tag = false
    for (let t=0; t<routeList.length; t++) {
      if ( (routeList[t].stNm).replace(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, "") == origin){

        Tag = true
        var arrInfo = routeList[t]
        var nowL = parseInt(arrInfo.staOrd)
        originId = arrInfo.arsId
        //------------저상버스 요청일 경우
        if(lowTag){
          arrInfo = http.getUrl( url + 'arrive/getLowArrInfoByRoute?ServiceKey='
                                + key + '&stId=' + routeList[t].stId + '&busRouteId=' + busRouteId + '&ord=' + nowL, 
                                {format: 'xmljs'}).ServiceResult.msgBody.itemList
        }

        firstT = min(parseInt(arrInfo.traTime1))
        firstL = minTag? (nowL-parseInt(arrInfo.sectOrd1) + "정거장 전") : " "
        if (arrInfo.busType1 == '1')
          firstLow = '/img/wheelchair.png'
        secondT = min(parseInt(arrInfo.traTime2))
        secondL = minTag? (nowL-parseInt(arrInfo.sectOrd2) + "정거장 전") : " "
        if (arrInfo.busType2 == '1')
          secondLow = '/img/wheelchair.png'
      }
      if ( Tag && routeList[t].stNm == destination ){
        destination = routeList[t].stNm
        numOfStation = parseInt(routeList[t].staOrd) - nowL
        break
      }
    }
    return Tag
  }

  // 버스 갯수만큼 반복
  for (let p=0; p<busNumber.length; p++){

    var find = false
    var busRouteId = false
    busNumber[p] = busNumber[p].replace("공","")
    busNumber[p] = busNumber[p].replace(" ","")
    var busSearch = isNaN(busNumber[p])? busNumber[p].replace(/[0-9]/g,""):busNumber[p]
    var busResponse = http.getUrl( url + 'busRouteInfo/getBusRouteList?ServiceKey=' 
                                  + key + '&strSrch=' + busSearch,
                                  {format: 'xmljs'}).ServiceResult.msgBody
    if (!Object.keys(busResponse).length){
      results.result.push({
        errorMsg: busNumber[p]+"번 버스는 존재하지 않습니다."
      })
      continue
    }
    if(busResponse.itemList.busRouteNm){

      busRouteId = busResponse.itemList.busRouteId

      find = arrTime(busRouteId, origin, destination)
      if ( find ){
        let busRouteType = busResponse.itemList.routeType
        results.result.push({
          busNumber : busNumber[p],
          firstArrtime : firstT,
          secondArrtime : secondT,
          firstLocation: firstL,
          secondLocation: secondL,
          firstLow: firstLow,
          secondLow: secondLow,
          busColor: busColorSet[busRouteType],
          busImage: busImageSet[busRouteType],
          numOfStation: numOfStation,
          timeTag: timeTag
        })
        continue
      } else {
        results.result.push({
          errorMsg: "해당 정류장에 해당 버스가 없어요."
        })
        continue
      }
    } else {
      var busList = busResponse.itemList

      for (let i=0; i<busList.length; i++){

        //버스 번호가 일치할경우(통째 같거나 숫자 부분이 같은 경우)
        if (busList[i].busRouteNm == busNumber[p] || 
            parseInt(busList[i].busRouteNm.replace(/[^0-9]/g,"")) == parseInt(busNumber[p].replace(/[^0-9]/g,""))) {

          busRouteId = busList[i].busRouteId
          //일치하는 정류장 있을 경우(모두 올바른 값!)
          find = arrTime(busRouteId, origin, destination)

          if ( find ){
            let busRouteType = busList[i].routeType
            results.result.push({
              busNumber : busNumber[p],
              firstArrtime : firstT,
              secondArrtime : secondT,
              firstLocation: firstL,
              secondLocation: secondL,
              firstLow: firstLow,
              secondLow: secondLow,
              busColor: busColorSet[busRouteType],
              busImage: busImageSet[busRouteType],
              numOfStation: numOfStation,
              timeTag: timeTag
            })
            break
          }
        }
      }   
    }

    if (!busRouteId) {
      results.result.push({
        errorMsg: busNumber[p]+"번 버스는 존재하지 않습니다."
      })
      continue
    }
    if (!find){
      results.result.push({
        errorMsg: "해당 정류장에 해당 버스가 없어요."
      })
    }
  }
  if(originId){
    results.originID = originId
    results.origin = origin
    results.destination = destination
  }
  return results
}