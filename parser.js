
// fs = require('fs');
// esprima = require('esprima');

// file = fs.readFileSync('./testCase1.js', 'utf8')

// console.log(file);

// file = esprima.parse(file);

// tokens = getInfo(file);

// for(var i in tokens) {

//   console.log(tokens[i]);

//   for(var j in tokens[i].members) {
//     refs = tokens[i].members[j].ref
//     if(refs != undefined && refs.length > 0) {
//       console.log(refs)
//     }
//   }
// }

var walkSync = function(dir, filelist) {

  if(dir[dir.length-1] != '/') dir = dir.concat('/')

  var fs = fs || require('fs');

  var files = fs.readdirSync(dir);

  filelist = filelist || [];

  files.forEach(function(file) {
    if (fs.statSync(dir + file).isDirectory()) {
      filelist = walkSync(dir + file + '/', filelist);
    }
    else {
      filelist.push(dir+file);
    }
  });
  return filelist;
};

// function removeProjDir(projDir, file){
  
// }

function parseProject(dirAddr) {

  fileList = walkSync(dirAddr);
  fileList = fileList.filter(function(item) {
    if(item.substr(item.lastIndexOf('.')) != '.js')
      return false;
    return true;
  })

  var info = {
    'classes': [],
    'attrs' : [],
    'funcs' : [],
  }

  fileList.forEach(function(file) {
    ret = parse(file)
    info.classes = info.classes.concat(ret.classes)
    info.attrs = info.attrs.concat(ret.attrs)
    info.funcs = info.funcs.concat(ret.funcs)
  })

  return info;
}

function parse(fileAddr) {
  if(fileAddr==undefined) throw 'parse: fileAddr must have a value!';

  var fs = require('fs');
  var esprima = require('esprima');

  var file = fs.readFileSync(fileAddr, 'utf8')

  var fileNode = esprima.parse(file)

  // No need to get the module name, better get the fully qualified name:
  // Uncomment if you change your mind.
  // fileAddr = fileAddr.split('/')
  // Get the last part of the string:
  // fileAddr = fileAddr[fileAddr.length-1]
  // If remove the extension is needed:
  // fileAddr = fileAddr.substr(0, fileAddr.lastIndexOf('.'));
  // console.log(fileAddr)

  return getInfo(fileNode, fileAddr)
}

exports.parse = parse;
exports.parseProject = parseProject;

// Functions:
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Verify if a function is a constructor function or a normal func.
function checkClass(funcNode) {
  var isClass=false;

  if(funcNode == undefined) {
    throw 'checkClass: funcNode is undefined!\n';
  }
  if(funcNode.type == undefined) {
    throw 'checkClass: funcNode has no type!\n';
  }
  if(funcNode.type=='Program') {
    traverse(funcNode, function(node,level) {
      if(level==2 
      &&(node.type=='FunctionExpression'
      || node.type=='FunctionDeclaration'))
        // Get funcNode = one(the last)
        // functionExpression/Declaration of the program.
        funcNode = node;
    })
  }
  if(funcNode.type!='FunctionExpression' &&
     funcNode.type!='FunctionDeclaration') {
    throw 'checkClass: Node type is not valid: '+funcNode.type+'!\n';
  }

  // Find the block statement:
  traverse(funcNode, function(node, level) {
    if(node.type == 'BlockStatement' && level==1) {
      // console.log(node.body);
      // Test if it contains at least one this expression:
      traverse(node, function(node,level) {
        if(level==1 && node.type == 'ExpressionStatement') {
          if(node.expression.type == 'AssignmentExpression') {
            if(checkThisAssignment(node.expression)) {
              // If there is at least one this assignment
              // This is a class constructor:
              isClass = true;
              return true;
            }
          }
        }
      });

      // After find the block force the recursion to stop:
      return true;
    }
  });

  return isClass;
}

function checkThisAssignment(assignmentNode) {
  if(assignmentNode.type != 'AssignmentExpression') {
    throw 'checkThisAssignment: assignmentNode is not of type AssignmentExpression!'
  }
  if(assignmentNode.left.type != 'MemberExpression')
    return false;
  if(assignmentNode.left.object.type != 'ThisExpression')
    return false;
  // Else:
  return true;
}

// Return a list of classes declared on 'file' with information on
// the name of members, and internal metrics for the members.
function getInfo(file, fileAddr) {
  var tokens = []
  var members;
  traverse(file, function(node, level) {
    // If class is declared as a variable pointing to a function:
    if(node.type == 'ExpressionStatement' && level==1) {
      // Add only functions to the list:
      if(node.expression.right.type == 'FunctionExpression') {
        if(checkClass(node.expression.right)) {
          members = getClassMembers(node);
          tokens.push({
            'name':node.id.name,
            'module':fileAddr,
            'memberNames':getMemberNames(members),
            'params': getParamNames(node.params),
            'members': members,
          });
        }
      }
    }
    // If class is declared directly as a function:
    if(node.type == 'FunctionDeclaration') {
      if(checkClass(node)) {
        members = getClassMembers(node);
        tokens.push({
          'name': node.id.name,
          'module':fileAddr,
          'memberNames':getMemberNames(members),
          'params': getParamNames(node.params),
          'members': members,
        });
      }
    }
  })

  var ret = {
    'attrs': [],
    'funcs': [],
    'classes': tokens,
  }

  // Preparing return structure:
  for(var c in tokens) {
    // console.log(tokens[c])
    for(var m in tokens[c].members) {
      // console.log(tokens[c].members[m])
      if(tokens[c].members[m].type=='Function') {
        // console.log(tokens[c][m])
        // process.exit();
        ret.funcs.push(tokens[c].members[m]);
      }
      else {
        ret.attrs.push(tokens[c].members[m]);
      }
    }
  }

  return ret;
}

// Return a list of strings containg only the names.
function getMemberNames(membersList) {
  var memberNames = []

  for(var i in membersList) {
    memberNames.push(membersList[i].name)
  }

  return memberNames;
}

// Return a list of strings containg only the names.
function getParamNames(paramList) {
  var paramNames = []

  for(var i in paramList) {
    paramNames.push(paramList[i].name)
  }

  return paramNames
}

function getFunctionReferences(functionBody, classNames) {
  classNames = classNames|null

  var references = []

  // Get all 'this.####' references:
  traverse(functionBody, function(node,level) {
    if(node.object != undefined) {
      if(node.object.type == 'ThisExpression') {
      // if(level==1) {
        // console.log(node);
        // console.log(node.property.name);
        references.push(node.property.name);
      }
    }
  })

  // TODO: Make the below if work.
  // The problem is that a reference to a class member should
  // only count if the name haven't been declared before inside
  // the function.
  // The way it is now, it would count all calls of functions,
  // if the name of the function belong to classNames array.
  // Doesn't count attribute references and doesn't check
  // if the name have been declared in the function body.
  //
  // Get any reference to a name contained on classNames array.
  // traverse(functionBody, function(node,level) {
  //   if(node.type === 'CallExpression'
  //     && node.callee.type === 'Identifier') {

  //     if(classNames.indexOf(node.callee.name)!=-1) {
  //       references.push(node.callee.name);
  //       // addStatsEntry(node.callee.name);
  //       // functionsStats[node.callee.name].calls++; //5
  //     }
  //   }

  // })

  return references;
}

function getClassMembers(classNode) {
  if(classNode.type!='FunctionExpression'
  && classNode.type!='FunctionDeclaration')
    throw 'getClassMembers: classNode is not a function!';

  var members = [];

  traverse(classNode.body.body, function(node,level) {
    // if(level==1) {
    //   console.log(node);
    //   return;
    // }

    // If it is a name declared in the function scope like:
    // var privVar = 10; or function privFunction(){}
    // These are the private class members.
    if(level==1
      && (node.type == 'VariableDeclaration'
      || node.type == 'FunctionDeclaration')) {

      traverse(node, function(node,level) {
        if(level==1 && node.type=='VariableDeclarator') {
          var member = {
            "type": node.init.type,
            "name": node.id.name,
            "class": classNode.id.name,
            "visible":false
          }
          if(member.type == 'FunctionExpression') {
            member.type = 'Function';
            member.params = getParamNames(node.init.params);
            member.body = node.init.body.body;
            // References using 'this'
            member.ref = getFunctionReferences(member.body);
          }
          members.push(member)
        }
      })
      // console.log(node.declarations);

      // End this traverse recursions.
      return true;
    }
    // If it is an expression like ('this.myFunc = func...')
    // These are the public class members.
    else if(level==1 && node.type=='ExpressionStatement') {
      if(node.expression.type != 'AssignmentExpression') return;
      if(node.expression.left.type != 'MemberExpression') return;
      if(node.expression.left.object.type != 'ThisExpression') return;
      exp = node.expression;
      var member = {
        "type": exp.right.type,
        "name": exp.left.property.name,
        "class": classNode.id.name,
        "visible":true
      }
      if(member.type == 'FunctionExpression') {
        member.type = 'Function';
        member.params = getParamNames(exp.right.params);
        member.body = exp.right.body.body;
        // References using 'this'
        member.ref = getFunctionReferences(member.body);
      }
      members.push(member)
      // console.log(node.expression);
    }
  })

  return members;
}

/* Functions: */

// Returns array1 ^ array2
function intersect(array1, array2) {
  return array1.filter(function(n) {
    return array2.indexOf(n) != -1;
  });
}

// Return array1 - array2
function substract(array1, array2) {
  return array1.filter(function(n) {
    return array2.indexOf(n) == -1;
  });
}

function traverse(node, func, level) {
    var level = level+1|0;

    // If function return true, end recursion:
    if(func(node,level)===true) return node;//1

    for (var key in node) { //2
        if (node.hasOwnProperty(key)) { //3
            var child = node[key];
            if (typeof child === 'object' && child !== null) { //4

                if (Array.isArray(child)) {
                    child.forEach(function(node) { //5
                        traverse(node, func, level);
                    });
                } else {
                    traverse(child, func, level); //6
                }
            }
        }
    }
    return null;
}
