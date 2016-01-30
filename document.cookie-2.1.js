var parsePart = /([^=]+)=([^;]*)/;
function cookie(document, domain, path, session, date) {
	domain = domain ? cookie.sanitizeDomain(domain) : "example.com";
	
	var interface = {
		domains: [],
		
		setCookie: function(cookie) {
			// returns cookie, with updated properties
			if (!("domain" in cookie)) { cookie.domain = this.domain; }
			if (!("path" in cookie)) { cookie.path = this.path; }
			
			var path = ensureDomainPath(this, cookie.domain, cookie.path);
			expireCookie(this, cookie.domain, path, cookie.key, cookie);
			path.cookies.push(cookie);
			cookie.stored = true;
			return this;
		},
		
		get: function() {
			console.log(JSON.stringify(this.domains));
			var cookies = this.domains[0].paths[0].cookies;
			var render = "";
			for (var i = 0, l = cookies.length; i < l; i++) {
				var cookie = cookies[i];
				render += (render ? ";" : "") + (cookie.key ? cookie.key + "=" : "") + cookie.value;
			}
			return render;
		},
		set: function(input) {
			// returns true if cookie was stored,
			// false if it was rejected
			var parts = input.split(";");
			var cookie = {};
			for (var i = 0, l = parts.length; i < l; i++) {
				var part = parts[i].split("=");
				if (part.length === 1) {
					cookie.key = "";
					cookie.value = part[0];
				}
				else {
					switch(part[0]) {
						default:
							if (!("key" in cookie)) {
								cookie.key = part[0];
								cookie.value = part[1];
							}
					}
				}
			}
			return this.setCookie(cookie);
		},
		
		documentObject: document || {},
		
		domain: domain,
		updateDomain: function(domain) {
			this.domain = domain === null ? null : cookie.sanitizeDomain("" + domain);
			return this;
		},
		
		path: path || "/",
		updatePath: function(path) {
			this.path = "" + path;
			return this;
		},
		
		session: session || {},
		expireSession: function() {
			var session = this.session = {};
			this.checkExpiry();
			return this;
		},
		
		date: date || new Date(),
		setDate: function(date) {
			this.date = date;
			this.checkExpiry();
			return this;
		},
		
		checkExpiry: function() {
			return this;
		}
	};
	
	return interface;
}

var domain_leadingDots = /^\.+/;
cookie.sanitizeDomain = function(domain) {
	return ("" + domain).replace(domain_leadingDots, "");
};

function ensureDomainPath(instance, domain, path) {
	var domainIndex, pathIndex, result;
	
	if ((domainIndex = findIndexByProp(instance.domains, "domain", domain)) === -1) {
		instance.domains.push({
			domain: domain,
			paths: [ result = {
				path: path, cookies: []
			} ]
		});
	}
	else if (findIndexByProp(instance.domains[domainIndex].paths, "path", path) === -1) {
		instance.domains[domainIndex].paths.push(result = {
			path: path,
			cookies: []
		});
	}
	
	return result;
}

function findIndexByProp(array, prop, value) {
	for (var i = 0, l = array.length; i < l; i++) {
		if (array[i][prop] === value) { return i; }
	}
	return -1;
}

function expireCookie(instance, domain, path, key, replacement) {
	var cookie;
	if (typeof path !== "object") {
		domain = instance.domains[findIndexByProp(instance.domains, "domain", domain)];
		path = domain.paths[findIndexByProp(domain.paths, "path", path)];
	}
	
	var index = findIndexByProp(path.cookies, "key", key);
	if (index !== -1) {
		cookie = path.cookies[index];
		if (replacement) { cookie.replacement = replacement; }
		path.cookies.splice(index, 1);
		cookie.stored = false;
	}
}

module.exports = cookie;