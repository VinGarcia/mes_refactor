
utils = exports

exports.contains = function(thisList, item, compFunc) {
  // console.log(thisList, item)
  function equal(item1,item2) { return item1==item2 }

  compFunc = (typeof compFunc == 'function' ? compFunc : equal)

  if(item instanceof Array) {
    for(i in item) {
      if(!utils.contains(thisList, item[i], compFunc))
        return false;
    }
    return true;
  }

  for(var i in thisList) {
    if(compFunc(thisList[i],item))
      return true;
  }
  return false;
}

exports.listAdded = function(thisList, otherList, compFunc) {
  var aux;
  var added = [];
  
  // console.log(thisList)
  // console.log(otherList)

  // console.log(otherList[0]);

  // return 'lol'


  // For item aux on otherList
  for(var a in otherList) {
    aux = otherList[a]

    if(!utils.contains(thisList, aux, compFunc))
      added.push(aux);
  }

  return added;
}

exports.listRemoved = function(thisList, otherList, compFunc) {
  var aux;
  var removed = [];
  
  // For item aux on thisList
  for(var a in thisList) {
    aux = thisList[a]

    if(!utils.contains(otherList, aux, compFunc))
      removed.push(aux);
  }

  return removed;
}

exports.equal = function(thisList, otherList, compFunc) {

  for(var i in thisList) {
    if(!utils.contains(otherList, thisList[i], compFunc)) {
      return false;
    }
  }

  if(thisList.length == otherList.length)
    return true;
  else
    return false;
}

exports.formatFloat = function(float, numDigits) {
  numDigits = numDigits || 4
  str = float.toString()
  return str.substr(0, str.indexOf('.')+numDigits+1)
}

//Tested:
// console.log(utils.contains([1,2,3],1))
// console.log(utils.contains([1,2,3],[2,3]))

