module.exports.function = function getArrBuslist_main (results, point) {

  const console = require("console")
  let results
  if(true){
    const seoul = require("./getArrBuslist_seoul")
    results = seoul.function(results)
  }else if(point.levelOne && point.levelOne.name == "경기도" ){
    const gg = require("./getArrBuslist_gg")
    results = gg.function(results)
  }
  return results
}
