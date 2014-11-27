var comp = require('./compFiles.js')
var metrics = require('./getRefactors.js').metrics
var parser = require('./parser.js')
var ff = require('./utils.js').formatFloat

var proj1 = parser.parseProject('./projetoTeste1');
var proj2 = parser.parseProject('./projetoTeste2');

var classComp = comp.compClass(proj1,proj2)
var attrComp = comp.compAttr(proj1,proj2)
var funcComp = comp.compFunc(proj1,proj2)

var obj;
var obj_aux;
//Tested:
try {
obj = {}
obj_aux = (metrics.classRefact.moveClass(classComp))
obj.refactor = 'moveClass'
obj.similarity = ff(similarity(obj_aux[0].before, obj_aux[0].after))
obj.before = obj_aux[0].before
obj.after = obj_aux[0].after
delete obj.before.params
delete obj.before.members
delete obj.after.params
delete obj.after.members
console.log(obj)
} catch(e) { }

try {
obj = {}
obj_aux = (metrics.classRefact.renameClass(classComp))
obj.refactor = 'renameClass'
obj.similarity = ff(similarity(obj_aux[0].before, obj_aux[0].after))
obj.before = obj_aux[0].before
obj.after = obj_aux[0].after
delete obj.before.params
delete obj.before.members
delete obj.after.params
delete obj.after.members
console.log(obj)
} catch(e) { }

try {
obj = {}
obj_aux = (metrics.attrRefact.hideField(attrComp))
obj.refactor = 'hideAttribute'
obj.similarity = ff(similarity(obj_aux[0].before, obj_aux[0].after))
obj.before = obj_aux[0].before
obj.after = obj_aux[0].after
console.log(obj)
} catch(e) { }

try {
obj = {}
obj_aux = (metrics.attrRefact.unhideField(attrComp))
obj.refactor = 'unhideAttribute'
obj.similarity = ff(similarity(obj_aux[0].before, obj_aux[0].after))
obj.before = obj_aux[0].before
obj.after = obj_aux[0].after
console.log(obj)
} catch(e) { }

try {
obj = {}
obj_aux = (metrics.funcRefact.hideMethod(funcComp))
obj.refactor = 'hideFunc'
obj.similarity = ff(similarity(obj_aux[0].before, obj_aux[0].after))
obj.before = obj_aux[0].before
obj.after = obj_aux[0].after
delete obj.before.body
delete obj.after.body
console.log(obj)
} catch(e) { }

try {
obj = {}
obj_aux = (metrics.funcRefact.unhideMethod(funcComp))
obj.refactor = 'unhideFunc'
obj.similarity = ff(similarity(obj_aux[0].before, obj_aux[0].after))
obj.before = obj_aux[0].before
obj.after = obj_aux[0].after
delete obj.before.body
delete obj.after.body
console.log(obj)
} catch(e) { }

try {
obj = {}
obj_aux = (metrics.funcRefact.addParameter(funcComp))
obj.refactor = 'addParameter'
obj.similarity = ff(similarity(obj_aux[0].before, obj_aux[0].after))
obj.before = obj_aux[0].before
obj.after = obj_aux[0].after
delete obj.before.body
delete obj.after.body
console.log(obj)
} catch(e) { }

try {
  // console.log('aqui')
obj = {}
obj_aux = (metrics.funcRefact.removeParameter(funcComp))
obj.refactor = 'removeParameter'
obj.similarity = ff(similarity(obj_aux[0].before, obj_aux[0].after))
obj.before = obj_aux[0].before
obj.after = obj_aux[0].after
delete obj.before.body
delete obj.after.body
console.log(obj)
  // console.log('la')
} catch(e) { console.log(e) }


function chooseCandidates(proj1,proj2) {

  results = {
    'class':[],
    'func':[],
    'attr':[],
  }
  var classComp = comp.compClass(proj1,proj2)
  var attrComp = comp.compAttr(proj1,proj2)
  var funcComp = comp.compFunc(proj1,proj2)

  for(var i in metrics.class) {
    func = metrics.class[i]
    results.class.push({'refactor':i, 'tuples':func(classComp)})
  }
  for(var i in metrics.func) {
    func = metrics.func[i]
    results.func.push({'refactor':i, 'tuples':func(classComp)})
  }
  for(var i in metrics.attr) {
    func = metrics.attr[i]
    results.attr.push({'refactor':i, 'tuples':func(classComp)})
  }

  return results;
}

console.log(chooseCandidates(proj1,proj2))

// Return the percentage of similarity between node1 and node2.
function similarity(node1, node2) {
  var ER = /\w(\w|\d)*/g
  var jsdiff = jsdiff||require('diff')

  var str1 = JSON.stringify(node1)
  var str2 = JSON.stringify(node2)

  var len1 = (str1.match(ER).length)
  var len2 = (str2.match(ER).length)

  var diff = jsdiff.diffWords(str1,str2);

  var obj = {'added':'','removed':''}

  for(var i=1; i<diff.length; i++) {
    if(diff[i].added) {
      obj.added += diff[i].value
    }
    if(diff[i].removed) {
      obj.removed += diff[i].value
    }
  }
  if(obj.added.match(ER))
    lenAdd = obj.added.match(ER).length
  else
    lenAdd = 0

  if(obj.removed.match(ER))
    lenRem = obj.removed.match(ER).length
  else
    lenRem = 0

  // console.log(len1,len2)
  // console.log('Added: ' + lenAdd, 'Removed: '+lenRem)
  // console.log('Similarity: ' + (1-((lenAdd+lenRem)/len1)))
  // Return similarity:
  // return (1-((lenAdd+lenRem)/len1))
  return ((len2-lenAdd)/len1)
}

exports.similarity = similarity;