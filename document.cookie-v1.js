var parsePart = /([^=]+)=([\W\w]*)/;
function cookie(document, domain, path, session, date) {
	document = document || {};
	domain = domain || "example.com";
	path = path || "/";
	
	var cookies = Object.create(null);
	var order = [];
	
	function getter() {
		var rendered = "";
		for (var i = 0, l = order.length; i < l; i++) {
			rendered += (
				(rendered ? "; " : "") +
				order[i] + "=" + cookies[order[i]].value
			);
		}
		return rendered;
	}
	function setter(value) {
		if (!value) { return; }
		
		var parts = value.split(";");
		if (parts.length < 1) { return; }
		
		var newCookie = {};
		for (var i = 0, expires, l = parts.length; i < l; i++) {
			var part = parts[i].match(parsePart);
			
			switch (part[1]) {
				case "path":
					newCookie.path = part[2]; break;
				case "domain":
					newCookie.domain = part[2]; break;
				case "max-age":
					expires = new Date();
					newCookie.expires = new Date(current.setSeconds(current.getSeconds() + (part[2] | 0))); break;
				case "expires":
					newCookie.expires = new Date(part[2]);
					break;
				default:
					if (!newCookie.key) {
						newCookie.key = part[1];
						newCookie.value = part[2];
					}
			}
		}
		
		if (newCookie.key) {
			setCookie(domain, path, cookies, order, newCookie);
		}
	}
	
	Object.defineProperty(document, "cookie", {
		get: getter, set: setter
	});
	
	var oldSession = session;
	
	return Object.defineProperties({}, {
		cookies: { value: cookies },
		get: { value: getter }, set: { value: setter },
		setCookie: { value: function(newCookie) {
			if (newCookie.maxAge) {
				var now = new Date();
				newCookie.expires = new Date(now.setSeconds(now.getSeconds() + newCookie.maxAge));
				delete newCookie.maxAge;
			}
			
			setCookie(domain, path, cookies, order, newCookie);
			return !newCookie.expired;
		} },
		documentObject: { value: document },
		
		expire: { value: function() {
			for (var i = 0, l = order.length; i < l; i++) {
				if (cookies[order[i]].expires === cookie.SESSION) {
					removeCookie(cookies, order, cookies[order[i]]);
					i--;
				}
			}
		} }
	});
}
cookie.SESSION = {};

function setCookie(domain, path, session, cookies, order, newCookie) {
	if (!newCookie.expires) { newCookie.expires = cookie.SESSION; }
	else if (newCookie.expires <= new Date()) {
		removeCookie(cookies, order, newCookie);
		return;
	}
	
	if (!newCookie.path) { newCookie.path = path; }
	if (!newCookie.domain) { newCookie.domain = domain; }
	if (!("secure" in newCookie)) {
		newCookie.secure = false;
	}
	if (!("expired" in newCookie)) { newCookie.expired = false; }
	
	cookies[newCookie.key] = newCookie;
	var orderIndex = order.indexOf(newCookie.key);
	if (orderIndex !== -1) {
		order.splice(orderIndex, 1);
	}
	order.push(newCookie.key);
}
function removeCookie(cookies, order, cookie) {
	if (cookie.key in cookies) {
		cookie.expired = true;
		delete cookies[cookie.key];
		var orderIndex = order.indexOf(cookie.key);
		if (orderIndex !== -1) {
			order.splice(orderIndex, 1);
		}
	}
}

module.exports = cookie;