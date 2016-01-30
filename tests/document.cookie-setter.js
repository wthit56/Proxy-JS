function setter(cookie) {
	var i1 = cookie(), i2 = cookie();
	var result = {
		i1: i1, i2: i2, NOT_SAME: {},
		
		result: undefined, same: true,
		set: function(cookie) {
			var a = i1, b = i2;
			
			i2.result = a.set(cookieToString(cookie)),
			i1.result = b.setCookie(cookie);
			this.result = similar(i1.result, i2.result) ? this.NOT_SAME : i1.result;
			return this;
		},
		get: function() {
			i1.result = i1.get(); i2.result = i2.get();
			return (this.result = (i1.result !== i2.result) ? this.NOT_SAME : i1.result);
		},
		expireSession: function() {
			i1.expireSession(); i2.expireSession();
		}
	};
	return result;
}

function similar(a, b) {
	if (a !== b) {
		for (var key in a) {
			if (b[key] !== a[key]) { return false; }
		}
	}
	return true;
}

function cookieToString(cookie) {
	var render = [cookie.key + "=" + (cookie.value || "")];
	if (cookie.expires) { render.push("expires=" + new Date(cookie.expires)); }
	if (cookie.maxAge) { render.push("max-age=" + cookie.maxAge); }
	shuffle(render);
	var result = render.join(";");
	return result;
}

function shuffle(array) {
	for (var i = 0, off, l = array.length; i < l; i++) {
		var a = Math.random() * l | 0, b = Math.random() * l | 0;
		off = array[a]; array[a] = array[b]; array[b] = off; off = null;
	}
}

function fuzzyCookie(expected) {
	var fuzzy = new RegExp("^" + expected.replace(/[=;]/g, " *$& *") + "$");
	return fuzzy;
}

module.exports = setter;