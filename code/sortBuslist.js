module.exports.function = function sortBuslist (results) {
  
  const console = require("console")
  const http = require("http")
  const fail = require("fail") 
  
  let new_result= []
  for(let i=0; i<results.result.length; i++){
    if(results.result[i].errorMsg.length == 0){
      new_result.push(results.result[i])     
    }
  }
  
  
  results.result = new_result
  
  results.result.sort(function (a, b) {
	return a.timeTag < b.timeTag ? -1 : a.timeTag > b.timeTag ? 1 : 0})

  return results
}
