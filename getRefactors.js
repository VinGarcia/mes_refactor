
var utils = require('./utils.js')




// console.log(proj1)


// console.log(classComp)
// console.log(attrComp)

//Tested:
// console.log(utils.formatFloat(diffNodes(proj1,proj2))+'%')

//Tested:
// console.log(moveClass(classComp))
// console.log(renameInterface(classComp))
// console.log(hideField(attrComp))
// console.log(unhideField(attrComp))
// console.log(hideMethod(funcComp))
// console.log(unhideMethod(funcComp))
// console.log(addParameter(funcComp))
// console.log(removeParameter(funcComp))

metrics = {
  'classRefact':{},
  'attrRefact':{},
  'funcRefact':{},
}

exports.metrics = metrics

metrics.funcRefact.addParameter = (function addParameter(funcComp) {
  return refactBase(funcComp, function(item1,item2) {
    return (item1.class==item2.class && item1.name==item2.name && item1.type==item2.type
      && item1.visible==item2.visible
      && !utils.equal(item1.params, item2.params)
      && utils.contains(item2.params, item1.params)
    )
  })
})

metrics.funcRefact.removeParameter = (function removeParameter(funcComp) {
  return refactBase(funcComp, function(item1,item2) {
    return (item1.class==item2.class && item1.name==item2.name && item1.type==item2.type
      && item1.visible==item2.visible
      && !utils.equal(item1.params, item2.params)
      && utils.contains(item1.params, item2.params)
    )
  })
})

metrics.classRefact.moveClass = (function moveClass(classComp) {
  return refactBase(classComp, function(item1,item2) {
    return (item1.name == item2.name && item1.module != item2.module)
  })
})

metrics.classRefact.renameClass = (function renameClass(classComp) {
  return refactBase(classComp, function(item1,item2) {
    return (item1.module==item2.module && item1.name != item2.name)
  })
})

metrics.attrRefact.hideField = (function hideField(fieldComp) {
  return refactBase(fieldComp, function(item1,item2) {
    return (item1.class==item2.class && item1.name==item2.name && item1.type==item2.type
      && item1.visible!=item2.visible && !item2.visible)
  })
})

metrics.attrRefact.unhideField = (function unhideField(fieldComp) {
  return refactBase(fieldComp, function(item1,item2) {
    return (item1.class==item2.class && item1.name==item2.name && item1.type==item2.type
      && item1.visible!=item2.visible && item2.visible)
  })
})

metrics.funcRefact.hideMethod = (function hideMethod(funcComp) {
  return refactBase(funcComp, function(item1,item2) {
    return (item1.class==item2.class && item1.name==item2.name && item1.type==item2.type
      && utils.equal(item1.params, item2.params)
      && item1.visible!=item2.visible && !item2.visible)
  })
})

metrics.funcRefact.unhideMethod = (function unhideMethod(funcComp) {
  return refactBase(funcComp, function(item1,item2) {
    return (item1.class==item2.class && item1.name==item2.name && item1.type==item2.type
      && utils.equal(item1.params, item2.params)
      && item1.visible!=item2.visible && item2.visible)
  })
})

function refactBase(comparison, checkMethod) {
  var touples = []

  // console.log(comparison.added)

  comparison.removed.forEach(function(item1, index1) {
    comparison.added.forEach(function(item2, index2) {
      // console.log(index1,index2)
      if(checkMethod(item1, item2)) {
        touples.push({
          'before': item1,
          'after' : item2,
        })
      }
    })
  })

  return touples;
}

/* * * * * Tests * * * * */

//Tested:
// var comp = require('./compFiles.js')
// console.log(comp.compClass(proj1,proj2));
// console.log(comp.compAttr(proj1,proj2));
// console.log(comp.compFunc(proj1,proj2));


