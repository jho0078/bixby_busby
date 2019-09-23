module.exports.function = function getNumOfStation (results) {
  
   let new_result= []
  for(let i=0; i<results.result.length; i++){
    if(results.result[i].errorMsg.length == 0){
      new_result.push(results.result[i])     
    }
  }
  results.result = new_result
  new_results = []
  for(let i=0 ; i < results.result.length ; i++){
    let result = {}
    result.origin = results.origin
    result.destination = results.destination
    result.numOfStation =  results.result[i].numOfStation
    result.busNumber = results.result[i].busNumber
    new_results.push(result)
  }
  
  return new_results
}
