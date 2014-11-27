
var parser = require('./parser.js');
var utils = require('./utils.js');

// Compare two class lists and return the diferences:
exports.compClass = function compareClass(list1, list2) {
  function classMatch(c1, c2) {
    if(c1.name == c2.name
      && c1.module == c2.module
      && utils.equal(c1.memberNames, c2.memberNames)
    )
      return true;
    return false;
  }

  return {
    'removed' : utils.listRemoved(list1.classes, list2.classes, classMatch),
    'added' : utils.listAdded(list1.classes, list2.classes, classMatch),
  }
}

exports.compAttr = function compareAttrs(list1,list2) {

  function attrMatch(a1, a2) {
    if(a1.name == a2.name
      && a1.class == a2.class
      && a1.type == a2.type
      && a1.visible == a2.visible
    )
      return true;
    return false;
  }

  return {
    'removed' : utils.listRemoved(list1.attrs, list2.attrs, attrMatch),
    'added' : utils.listAdded(list1.attrs, list2.attrs, attrMatch),
  }
}

exports.compFunc = function compareFuncs(list1,list2) {

  function funcMatch(a1, a2) {
    if(a1.name == a2.name
      && a1.class == a2.class
      && a1.type == a2.type
      && a1.visible == a2.visible
      && utils.equal(a1.params, a2.params)
      && utils.equal(a1.ref, a2.ref)
    )
      return true;
    return false;
  }

  return {
    'removed' : utils.listRemoved(list1.funcs, list2.funcs, funcMatch),
    'added' : utils.listAdded(list1.funcs, list2.funcs, funcMatch),
  }
}

/* * * * * Testes: * * * * */
// Tested:
// console.log(classMatch(file1.classes[0], file1.classes[0]))
// console.log(utils.equal([0,1,2],[0,1,2]))
// console.log(utils.contains([1,2,3], 3));

// Tested:
// console.log(utils.listAdded(file1.classes, file2.classes, classMatch))
// console.log(compareClass(file1, file2))

// Tested:
// var aux=2;
// console.log(file1.funcs[aux]); console.log( file2.funcs[aux]);
// console.log(funcMatch(file1.funcs[aux],file2.funcs[aux]));
// function funcMatch(a1, a2) {
//   if(a1.name == a2.name
//     && a1.class == a2.class
//     && a1.type == a2.type
//     && a1.visible == a2.visible
//     && utils.equal(a1.params, a2.params)
//     && utils.equal(a1.ref, a2.ref)
//   )
//     return true;
//   return false;
// }

// Tested:
// console.log(compareClass(file1,file2));
// console.log(compareFuncs(file1,file2))
// console.log(compareAttrs(file1,file2))

