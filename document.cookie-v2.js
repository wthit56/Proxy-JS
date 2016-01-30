var parsePart = /([^=]+)=([^;]*)/, domain_leadingDots = /^\.+/;
function cookie(document, domain, path, session, date) {
	domain = domain ? cookie.sanitizeDomain(domain) : "example.com";
	
	var interface = {
		domains: {}, domainList: [],
		
		setCookie: function(newCookie) {
			// returns newCookie, updated with default values and so on
			do {
				if ((newCookie.key.indexOf(";") !== -1) || (newCookie.value.indexOf(";") !== -1)) {
					newCookie.stored = false; break;
				}
				
				expireCookie(newCookie, this);
				
				if ("expires" in newCookie) {
					if (typeof newCookie.expires === "number") {
						newCookie.expires = new Date(newCookie.expires);
					}
					else if (!(newCookie.expires instanceof Date)) { // session
						if (newCookie.expires !== this.session) {
							newCookie.stored = false; break;
						}
					}
				}
				else if ("maxAge" in newCookie) {
					newCookie.expires = new Date(this.date.getTime() + (newCookie.maxAge * 1000));
				}
				else { // session
					newCookie.expires = this.session;
				}

				if (newCookie.expires instanceof Date) {
					newCookie.expires = new Date(Math.floor(newCookie.expires / 1000) * 1000);
				}
				
				if (!("domain" in newCookie)) {
					newCookie.domain = this.domain;
				}
				else {
					newCookie.domain = cookie.sanitizeDomain(newCookie.domain);
				}
				
				if (!("path" in newCookie) || (newCookie.path[0] !== "/")) {
					newCookie.path = this.path;
				}
				
				if (newCookie.expires <= this.date) {
					newCookie.stored = false; break;
				}
				else {
					setCookie(newCookie, this);
				}
			} while(false);
			
			return newCookie;
		},
		
		get: function() {
			var render = "";
			for (var i = 0, key, cookie, l = this.order.length; i < l; i++) {
				key = this.order[i];
				cookie = this.cookies[key];

				if (
					(cookie.domain === this.domain) && (
						(cookie.path === this.path) ||
						((this.path + "/").indexOf(cookie.path +
							(cookie.path[cookie.path.length - 1] === "/" ? "" : "/")
						) === 0)
					)
				) {
					render += (render ? ";" : "") + (key ? key + "=" : "") + this.cookies[key].value;
				}
			}
			return render;
		},
		set: function(input) {
			// returns true if cookie was stored,
			// false if it was rejected
			var parts = input.split(";");
			var newCookie = {};
			for (var i = 0, l = parts.length; i < l; i++) {
				var part = parts[i].match(parsePart);
				if (!part) {
					if (!newCookie.key && (parts[i][0] !== "=")) {
						newCookie.key = "";
						newCookie.value = parts[i];
					}
				}
				else {
					switch (part[1]) {
						case "max-age": part[2] = +this.date + (part[2] * 1000 | 0);
						case "expires": newCookie.expires = new Date(isNaN(part[2]) ? part[2] : +part[2]); break;
						default:
							if (!newCookie.key) {
								newCookie.key = part[1];
								newCookie.value = part[2];
							}
					}
				}
			}
			
			return this.setCookie(newCookie);
		},
		
		documentObject: document || {},
		
		domain: domain,
		updateDomain: function(domain) {
			if (domain != null) {
				this.domain = "" + domain;
			}
			this.domain = cookie.sanitizeDomain(this.domain);
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
			for (var key in this.cookies) {
				var cookie = this.cookies[key];
				if (cookie.expires instanceof Date) {
					if (cookie.expires < this.date) { expireCookie(cookie, this); }
				}
				else {
					 if (cookie.expires !== this.session) { expireCookie(cookie, this); }
				 }
			}
			return this;
		}
	};
	
	return interface;
}

cookie.sanitizeDomain = function(domain) {
	return ("" + domain).replace(domain_leadingDots, "");
};

function expireCookie(cookie, instance) {
	if (cookie && cookie.stored) {
		cookie.stored = false;
		var domain, path;
		if ((domain = instance.domains[cookie.domain]) && (path = domain[cookie.path])) {
			var index = path.cookieKeyList.indexOf(cookie.key);
			if (index !== -1) {
				path.cookieKeyList.splice(index, 1);
				delete path.cookies[cookie.key];
				if (path.cookieKeyList.length === 0) {
					index = domain.pathList.indexOf(cookie.path);
					if (index !== -1) {
						domain.pathList.splice(index, 1);
						delete domain[cookie.path];
						if (domain.pathList.length === 0) {
							index = instance.domainList.indexOf(cookie.domain);
							if (index !== -1) {
								instance.domainList.splice(index, 1);
								delete instance.domain[cookie.domain];
							}
						}
					}
				}
			}
		}
	}
}

function setCookie(cookie, instance) {
	ensureDomainPath(cookie.domain, cookie.path, instance);
	domain = instance[cookie.domain]; path = domain[cookie.path];
	domain.pathList.push(newCookie.key);
	instance.cookies[newCookie.key] = newCookie;
	newCookie.stored = true;
}

function ensureDomainPath(domain, path, instance) {
	if (!(domain in instance.domains)) {
		instance.domains[domain] = {
			paths: Object.create(null), pathList: []
		};
	}
	if (!(path in instance.domains[domain])) {
		instance.domains[domain][path] = {
			cookies: Object.create(null), cookieKeyList: []
		};
	}
}

module.exports = cookie;