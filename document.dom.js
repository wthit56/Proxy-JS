if (typeof DOMException === "undefined") { DOMException = Error; }

var document = {};

function Attr(name, value) {
	var attr = Object.create(null, {
		name: { value: "" + name, enumerable: true }
	});
	attr.value = "" + value;
	return attr;
}
function ClassList() {
	var cl = [];
	cl.item = function(index) { return this[index]; };
	//cl.contains = function(class) { return this.indexOf() !== -1; };
	
	return cl;
}

var node = Object.create(null, {
	ownerDocument: { value: document },
	
	nextSibling: { get: function() {
		return this.parentNode ?
			this.parentNode.childNodes[this.parentNode.childNodes.indexOf(this) + 1]
			: null;
	} },
	previousSibling: { get: function() {
		return this.parentNode ?
			this.parentNode.childNodes[this.parentNode.childNodes.indexOf(this) - 1]
			: null;
	} },
	
	nodeName: { get: function() {
		return (
			this.nodeType === 1 ? this.tagName :
			this.nodeType === 3 ? "#text" :
				null
		);
	} },
	nodeValue: { get: function() {
		return (this.nodeType === 3 ? this.text : null);
	} },
	
	textContent: {
		get: function() {
			if (this.nodeType === 3) { return this.nodeValue; }
			else {
				var text = "";
				for (var i = 0, l = this.childNodes.length; i < l; i++) {
					text += this.childNodes[i].textContent;
				}
				return text;
			}
		},
		set: function(value) {
			if (this.nodeType === 3) {
				this.text = "" + value;
			}
			else {
				while (this.childNodes.length > 0) {
					this.childNodes.pop().parentNode = null;
				}
				this.appendChild(this.ownerDocument.createTextNode("" + value));
			}
		}
	},
	
	outerHTML: { get: function() {
		if (this.nodeType === 3) { return this.text; }
		else {
			
		}
	} }
});

document.createElement = (function() {
	var elemNode = Object.create(node, {
		nodeType: { value: 1 },
		
		childElementCount: { get: function() {
			var c = 0;
			for (var i = 0, l = this.childNodes.length; i < l; i++) {
				if (this.childNodes[i].nodeType === 1) { c++; }
			}
			return c;
		} },
		children: { get: function() {
			return this.childNodes.filter(function(v) { return v.nodeType === 1; });
		} },
		
		firstChild: { get: function() {
			return this.childNodes[0] || null;
		} }, firstElementChild: { get: function() {
			for (var i = 0, l = this.childNodes.length; i < l; i++) {
				if (this.childNodes[i].nodeType === 1) { return this.childNodes[i]; }
			}
			return null;
		} },
		lastChild: { get: function() {
			return this.childNodes[this.childNodes.length - 1] || null;
		} }, lastElementChild: { get: function() {
			for (var i = this.childNodes.length - 1; i >= 0; i--) {
				if (this.childNodes[i].nodeType === 1) { return this.childNodes[i]; }
			}
			return null;
		} },
		
		nextElementSibling: { get: function() {
			if (!this.parentNode) { return null; }
			else {
				var current = this.parentNode.childNodes.indexOf(this),
					l = this.parentNode.childNodes.length;
				do { current++; } while ((current < l) && (this.parentNode.childNodes[current].nodeType !== 1));
				return current >= l ? null : this.parentNode.childNodes[current];
			}
		} },
		previousElementSibling: { get: function() {
			if (!this.parentNode) { return null; }
			else {
				var current = this.parentNode.childNodes.indexOf(this);
				do { current--; } while ((current >= 0) && (this.parentNode.childNodes[current].nodeType !== 1));
				return current < 0 ? null : this.parentNode.childNodes[current];
			}
		} },
		
		appendChild: { value: function(child) {
			if (child.parentNode) {
				child.parentNode.removeChild(child);
			}
			this.childNodes.push(child);
			child.parentNode = this;
			return child;
		} },
		removeChild: { value: function(child) {
			var index = this.childNodes.indexOf(child);
			if (index === -1) { throw new Error("Node is not a child of this node."); }
			else {
				this.childNodes.splice(index, 1);
				child.parentNode = null;
				return child;
			}
		} },
		
		setAttribute: { value: function(name, value) {
			if (value == null) { throw new Error("setAttribute: No value given."); }
			else {
				name = name.toLowerCase();
				if (name in this.attributes) {
					this.attributes[name].value = "" + value;
				}
				else {
					this.attributes.push(this.attributes[name] = Attr(name, value));
				}
			}
		} },
		getAttribute: { value: function(name) {
			name = name.toLowerCase();
			return name in this.attributes ? this.attributes[name].value : null;
		} }
	});
	var split = / */g;
	return function document_createElement(tagName) {
		var newNode = Object.create(elemNode, {
			tagName: { value: tagName, enumerable: true },
			className: { value: "", writable: true, enumerable: true },
			attributes: { value: [], enumerable: true },
			childNodes: { value: [], enumerable: true },
			parentNode: { value: null, writable: true },
			classList: { value: Object.create({
				contains: function(className) { return (" " + newNode.className + " ").indexOf(className) !== -1; },
				item: function(index) { return newNode.className.split(split)[index]; },
				add: function(className) { newNode.className += (newNode.className ? " " : "") + className; },
				remove: function(className) { newNode.className = (" " + newNode.className + " ").replace(" " + className + " ", " ").substr(1, newNode.className.length - 2); },
				toggle: function(className) {
					if (this.contains(className)) { this.remove(className); return false; }
					else { this.add(className); return true; }
				}
			}, {
				length: { get: function() {
					return newNode.className.split(split).length;
				} }
			}) }
		});
		return newNode;
	};
})();
	
document.createTextNode = (function() {
	var textNode = Object.create(node, {
		nodeType: { value: 3 }
	});
	return function document_createTextNode(text) {
		var newNode = Object.create(textNode, {
			text: { value: "" + text, writable: true, enumerable: true },
			parentNode: { value: null, writable: true }
		});
		return newNode;
	};
})();

if (typeof module !== "undefined") { module.exports = document; }
