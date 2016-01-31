console.log(require("inline-test/markup.js")(eval("(" + require("inline-test")(function() {
var document = require("../document.dom.js");
var test = require("./test.js");

var elemNode = document.createElement("HTML");
elemNode.nodeType === 1; ///
elemNode.nodeType = 2; elemNode.nodeType === 1; ///

elemNode.tagName === "HTML"; ///
elemNode.tagName = "A"; elemNode.tagName === "HTML"; ///

!elemNode.parentNode; ///
elemNode.nodeName === "HTML"; ///
!elemNode.nodeValue; ///
elemNode.childNodes.length === 0; ///

var textNode = document.createTextNode("text");
textNode.nodeType === 3; ///
textNode.nodeType = 2; textNode.nodeType === 3; ///

textNode.nodeName === "#text"; ///
textNode.nodeValue === "text"; ///
textNode.textContent === "text"; ///

textNode.text === "text"; ///

!textNode.parentNode; ///
elemNode.appendChild(textNode) === textNode; ///
elemNode.childNodes.length === 1; ///
elemNode.childNodes[0] === textNode; ///
textNode.parentNode === elemNode; ///

elemNode.textContent === "text"; ///

var otherNode = document.createElement("HTML");
otherNode.firstElementChild === null; ///
otherNode.lastElementChild === null; ///

test.catch(function() { otherNode.removeChild(textNode); }); ///
elemNode.removeChild(textNode) === textNode; ///
!textNode.parentNode; ///

elemNode.appendChild(textNode);
otherNode.appendChild(textNode) === textNode; ///
elemNode.childNodes.length === 0; ///

var childNode = document.createElement("A");
otherNode.appendChild(childNode);
test.arrayCompare(otherNode.childNodes, [textNode, childNode]); ///
otherNode.appendChild(textNode);
test.arrayCompare(otherNode.childNodes, [childNode, textNode]); ///

!childNode.previousSibling; ///
childNode.nextSibling === textNode; ///
textNode.previousSibling === childNode; ///
!textNode.nextSibling; ///

otherNode.firstChild === childNode; ///
otherNode.lastChild === textNode; ///

var contentNode = otherNode.appendChild(document.createTextNode("content"));
otherNode.textContent === "textcontent"; ///

test.arrayCompare(otherNode.children, [childNode]); ///

textNode.nextSibling === contentNode; ///
contentNode.previousSibling === textNode; ///
!contentNode.nextSibling; ///

otherNode.childElementCount === 1; ///

contentNode.textContent = "changed";
contentNode.textContent === "changed"; ///

otherNode.textContent = "overwritten";
otherNode.textContent === "overwritten"; /// textContent changed
otherNode.childNodes.length === 1; ///
!childNode.parentNode && !textNode.parentNode && !contentNode.parentNode; ///

otherNode.attributes.length === 0;
test.catch(function() { otherNode.setAttribute("a"); }); ///
otherNode.setAttribute("a", "b");
otherNode.attributes.length === 1; ///
otherNode.attributes["a"] && otherNode.attributes["a"].value === "b"; ///
otherNode.getAttribute("a") === "b"; ///

otherNode.setAttribute("a", 1);
otherNode.attributes.length === 1; ///
otherNode.getAttribute("a") === "1"; ///

!otherNode.getAttribute("1"); ///
otherNode.getAttribute("A") === "1"; ///

otherNode.setAttribute("B", 2);
otherNode.attributes["b"]; ///
!otherNode.attributes["B"]; ///
otherNode.getAttribute("B") === "2"; ///
otherNode.getAttribute("b") === "2"; ///

otherNode.className === ""; ///
otherNode.classList.length === 0; ///
otherNode.classList.add("z");
otherNode.className === "z"; ///

otherNode.className = "a b"; otherNode.className === "a b"; ///
otherNode.classList.length === 2; ///

otherNode.classList.contains("a"); ///
!otherNode.classList.contains("c"); ///
otherNode.classList.item(1) === "b"; ///
otherNode.classList.add("d");
otherNode.className === "a b d"; ///
otherNode.classList.length === 3;
otherNode.classList.remove("b");
otherNode.classList.length === 2; ///
otherNode.className === "a d"; ///

otherNode.classList.toggle("e"); ///
otherNode.className === "a d e"; ///
!otherNode.classList.toggle("d"); ///
otherNode.className === "a e"; ///

var a = otherNode.appendChild(document.createElement("A"));
var mid = otherNode.appendChild(document.createTextNode("mid"));
var b = otherNode.appendChild(document.createElement("B"));
var c = otherNode.appendChild(document.createElement("C"));

otherNode.firstElementChild === a; ///
otherNode.lastElementChild === c; ///

a.nextElementSibling === b; ///
b.nextElementSibling === c; ///
c.nextElementSibling === null; ///

a.previousElementSibling === null; ///
b.previousElementSibling === a; ///
c.previousElementSibling === b; ///

var n = document.createElement("N");
n.nextElementSibling === null; ///
n.previousElementSibling === null; ///

}) + ")")()));