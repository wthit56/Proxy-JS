var parsePart = /([^=]+)=([^;]*)/;
function Cookie(documentObject, domain, path, session, date) {
	domain = domain ? Cookie.sanitizeDomain(domain) : "example.com";
	
	if (typeof documentObject !== "object") {
		documentObject = {};
	}
	
	var interface = {
		cookies: [],
		
		setCookie: function(cookie) {
			if (cookie.key.indexOf(";") !== -1) { throw new Error("Malformed cookie key: " + JSON.stringify(cookie.key) + "."); }
			if (cookie.value.indexOf(";") !== -1) { throw new Error("Malformed cookie value: " + JSON.stringify(cookie.value) + "."); }
			
			if (!("domain" in cookie)) {
				cookie.domain = this.domain;
			}
			else if (cookie.domain !== null) {
				cookie.domain = Cookie.sanitizeDomain(cookie.domain);
			}
			
			if (!("path" in cookie)) {
				cookie.path = this.path;
			}
			else if (cookie.path[0] !== "/") {
				cookie.path = this.path;
			}
			
			if ("maxAge" in cookie) {
				cookie.expires = new Date((cookie.maxAge * 1000) + this.date.getTime());
				delete cookie.maxAge;
			}
			else if (!("expires" in cookie)) {
				cookie.expires = this.session;
			}
			else if (cookie.expires instanceof Date) {
				cookie.expires = new Date(cookie.expires.setMilliseconds(0));
			}
			else {
				var date = cookie.expires = new Date(cookie.expires);
				date.setMilliseconds(0);
			}
			
			for (var i = 0, l = this.cookies.length; i < l; i++) {
				oldCookie = this.cookies[i];
				if (
					(oldCookie.key === cookie.key) &&
					(oldCookie.domain === cookie.domain) &&
					(oldCookie.path === cookie.path)
				) {
					this.cookies.splice(i, 1);
					oldCookie.stored = false;
					oldCookie.replacement = cookie;
					break;
				}
			}
			
			if (
				Cookie.domainContains(cookie.domain, this.domain) &&
				(
					(cookie.expires instanceof Date
						? (cookie.expires > this.date)
						: (cookie.expires === this.session)
					)
				)
			) {
				this.cookies.push(cookie);
				cookie.stored = true;
			}
			else {
				cookie.stored = false;
			}
			
			return interface;
		},
		
		get: function() {
			var render = "";
			for (var i = 0, l = this.cookies.length; i < l; i++) {
				var cookie = this.cookies[i];
				if (
					Cookie.domainContains(cookie.domain, this.domain) && 
					Cookie.pathContains(cookie.path, this.path)
				) {
					render += (render ? ";" : "") + (cookie.key ? cookie.key + "=" : "") + cookie.value;
				}
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
				if ((part.length === 1) && !("key" in cookie)) {
					cookie.key = "";
					cookie.value = part[0];
				}
				else {
					switch(part[0]) {
						case "max-age": cookie.maxAge = +part[1]; break;
						case "expires": cookie.expires = new Date(part[1]); break;
						case "domain": cookie.domain = part[1]; break;
						case "path": cookie.path = part[1]; break;
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
		
		documentObject: documentObject,
		
		domain: domain,
		updateDomain: function(domain) {
			this.domain = domain === null ? null : Cookie.sanitizeDomain("" + domain);
			return this;
		},
		
		path: path || "/",
		updatePath: function(path) {
			if (path[0] !== "/") {
				throw new Error("Invalid path; not absolute: " + JSON.stringify(path) + ".");
			}
			else {
				this.path = "" + path;
				return this;
			}
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
			var cookie;
			for (var i = 0, l = this.cookies.length; i < l; i++) {
				cookie = this.cookies[i];
				if (cookie.expires instanceof Date
					? (cookie.expires <= this.date)
					: (cookie.expires !== this.session)
				) {
					cookie.stored = false;
					this.cookies.splice(i, 1);
					i--; l--;
				}
			}
			cookie = null;
			
			return this;
		}
	};
	
	Object.defineProperty(documentObject, "cookie", {
		get: function() { return interface.get(); },
		set: function(input) { interface.set(input); }
	});
	
	return interface;
}

var domain_leadingDots = /^\.+/;
Cookie.sanitizeDomain = function(domain) {
	return ("" + domain).replace(domain_leadingDots, "");
};
Cookie.domainContains = function(container, domain) {
	return (
		(domain.indexOf(".") > 0) && (container.indexOf(".") > 0) &&
		(
			(domain === container) ||
			(
				(domain.substr(-container.length) === container) &&
				(domain[domain.length - container.length - 1] === ".")
			)
		)
	);
};
Cookie.pathContains = function(container, path) {
	return (
		(container === path) ||
		(
			(path.substr(0, container.length) === container) &&
			(path[container.length - 1] === "/")
		)
	);
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

module.exports = Cookie;