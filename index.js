function add(name) {
	module.exports[name] = require("./" + name + ".js");
}
add("document.cookie");
