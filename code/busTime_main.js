module.exports.function = function main (origin, destination, busNumber,lowTag, point) {
  
  let results
  if(point.locality == "서울특별시"){
    const seoul = require("./busTime_seoul")
    results = seoul.function(origin, destination, busNumber, lowTag)
  }else if(point.levelOne && point.levelOne.name == "경기도" ){
    const gg = require("./busTime_gg")
    results = gg.function(origin, destination, busNumber)
  } else{
    var results = {"result":[],}
    results.result.push({
      errorMsg: "서비스 가능 지역이 아닙니다."
    })
  }
  return results
}