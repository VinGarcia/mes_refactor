
function myClass() {
  var privAttr1 = 5;
  var privAttr2=6;
  var privFunc1 = function(){console.log('privFun!');}
  var privFunc2=function(){console.log('privFun!');}
  this.attr1 = 10;
  this.attr2 = 20;
  this.fun1 = function(value) {
    console.log("fun1, val: " + value);
  }
  this.fun2 = function(value) {
    console.log("fun2, val: " + value);
    this.attr1 = 20;
    this.attr2 = 30;
  }
}

myFunc = function() {
  console.log("myFunc");
}

// myFunc();

c = new myClass();

// c.fun1(c.attr1);
















