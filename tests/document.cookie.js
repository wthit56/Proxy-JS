var inline_test = require("inline-test"), markup = require("inline-test/markup.js"), result = eval("(" + inline_test(function tests() {try {
var Cookie = require("../document.cookie.js"), test = require("./document.cookie-setter.js");

var i, error, date;
try { error = null; i = Cookie(); } catch (_error) { error = _error; } !error; /// should not error when no arguments are given
i.get instanceof Function; ///
i.set instanceof Function; ///
i.setCookie instanceof Function; ///
(Array.isArray(i.cookies) && (i.cookies.length === 0)); /// no cookies set

Cookie.domainContains instanceof Function; ///
	var dc = Cookie.domainContains;
	!dc("com", "com"); ///
	!dc("com", ".com"); ///
	!dc("com", "com"); ///
	!dc(".com", ".com"); ///
	!dc("1.com", ".com"); ///
	!dc(".com", "1.com"); ///
	dc("1.com", "1.com"); ///
	
	dc("1.com", "1.com"); ///
	dc("domain.com", "domain.com"); ///
	!dc("domain.com", "wonky-domain.com"); ///
	dc("domain.com", "sub.domain.com"); ///
	!dc("sub.domain.com", "domain.com"); ///

Cookie.pathContains instanceof Function; ///
	var pc = Cookie.pathContains;
	pc("/", "/"); ///
	!pc("/path", "/"); ///
	!pc("/path", "/path-incorrect"); ///
	pc("/", "/path"); ///
	!pc("/path/sub-dir", "/path"); ///
	!pc("/path/sub-dir", "/path/other-dir"); ///
	pc("/path/sub-dir", "/path/sub-dir"); ///

var render, newCookie;
i = Cookie(); // .setCookie()
	// key-value set
	var firstCookie;
	i.setCookie(firstCookie = { key: "a", value: "1" }); firstCookie.stored === true; /// set successfully
	i.get() === "a=1"; /// key-value rendered by getter
	
	i.setCookie(newCookie = { key: "a", value: "2" }).get() === "a=2"; /// value updated and rendered
	i.cookies.length === 1; /// old cookie removed
	firstCookie.replacement === newCookie; /// oldCookie points to new cookie
	
	// order updated
	i.setCookie({ key: "b", value: "3" }).get() === "a=2;b=3"; /// new key-values added
	i.setCookie({ key: "a", value: "4" }).get() === "b=3;a=4"; /// updated key-values move to the end
	
	// errors thrown
	try { error = null; i.setCookie({ key: "mal;formed", value: "" }); } catch (_error) { error = _error; } error; /// mal-formed key should throw error
	try { error = null; i.setCookie({ key: "", value: "mal;formed" }); } catch (_error) { error = _error; } error; /// mal-formed value should throw error
	i.get() === "b=3;a=4"; /// no new cookies set

i = Cookie(); // .set()
	// key-value set
	i.set("a=1");
	(i.cookies.length === 1) && (i.cookies[0].stored === true); ///
	i.get() === "a=1"; ///
	
	i.set("a=2").get() === "a=2"; ///
	(i.cookies.length === 1) && (i.cookies[0].value === "2"); ///
	
	// order updated
	i.set("b=3").get() === "a=2;b=3"; ///
	i.set("a=4").get() === "b=3;a=4"; ///

	i.set("mal;formed=");
	(i.cookies.length === 3) && (i.cookies[2].key === "") && (i.cookies[2].value === "mal"); ///
	i.set("=mal;formed");
	(i.cookies.length === 3) && (i.cookies[2].key === "") && (i.cookies[2].value === "mal"); ///

	i.set("b=4;max-age=3");
	(i.cookies.length === 3) && (+i.cookies[2].expires === i.date.getTime() + 3000); ///

	i.domain = "example.com"; i.path = "/";
	date = new Date((date = new Date()).setFullYear(date.getFullYear() + 1));
	i.set("domain=" + i.domain + ";c=5;expires=" + date + ";path=" + i.path + ";ignored=data");
	newCookie = i.cookies[3];
	(i.cookies.length === 4) && (+newCookie.expires === date.setMilliseconds(0)) && (newCookie.path === i.path) && (newCookie.domain === i.domain) && (newCookie.key === "c") && (newCookie.value === "5"); ///

i = Cookie(); // cookie.domain
	i.domain = "sub2.sub1.site1.com";
	i.setCookie(newCookie = { key: "a", value: "1" });
	newCookie.domain === i.domain; /// domain added
	i.get() === "a=1"; /// cookie rendered
	
	i.setCookie(newCookie = { key: "a", value: "1.1", domain: "site2.com" });
	newCookie.stored === false; /// cannot set cookies outside of domain

	i.setCookie(newCookie = { key: "a", value: "1.2", domain: "sub3.sub1.site1.com" });
	newCookie.stored === false; /// cannot set cookies outside of sub domain
	
	i.setCookie(newCookie = { key: "a", value: "2", domain: "site1.com" });
	newCookie.stored === true; /// cookie with parent domain stored
	i.get() === "a=1;a=2"; /// new cookie from different domain; old cookie still shown, order preserved
	
	i.domain = "site2.com";
	i.get() === ""; /// cookies with other domains not rendered
	
	i.domain = "sub2.sub1.site1.com";
	i.get() === "a=1;a=2"; /// cookies from first domain should still exist
	
	i.domain = "sub1.site1.com";
	i.setCookie({ key: "a", value: "3", domain: "sub1.site1.com" });
	i.get() === "a=2;a=3"; /// sub domains show higher-level domain's cookies

	i.updateDomain("...domain") === i; /// .updateDomain sanitizes value
	i.domain === "domain"; ///

	if (0) {
		0 /// TODO: add `domain=null` tests
	}

i = Cookie(); // cookie.path
	i.path = "/path";
	i.setCookie(newCookie = { key: "a", value: "1" });
	newCookie.path === i.path; /// path added
	i.get() === "a=1"; /// cookie with current path rendered

	i.setCookie({ key: "b", value: "2", path: "/" });
	i.get() === "a=1;b=2"; /// cookie with parent path should be rendered
	
	i.path = "/other-path";
	i.get() === "b=2"; /// cookies with different path should not be rendered
	
	i.updatePath("/path") === i; ///
	i.path === "/path"; ///
	
	i.setCookie({ key: "b", value: "3", path: "/path" });
	i.get() === "a=1;b=2;b=3"; /// old path removed
	
	try { error = null; i.updatePath("maformed-path"); } catch (_error) { error = _error; } error; /// error thrown for malformed path
	
	if (0) {
		0 /// TODO: add more malformed path tests
	}
	
i = Cookie(); // cookie.expires
	date = i.date = new Date(1000);
	i.setCookie(newCookie = { key: "a", value: "0.1", expires: new Date(999) });
	+newCookie.expires === 0; /// rounded down to whole seconds
	newCookie.stored === false; /// expires is in the past; should not be stored
	
	i.setCookie(newCookie = { key: "a", value: "1", expires: new Date(1000) });
	+newCookie.expires === 1000; /// no rounding needed
	newCookie.stored === false; /// current date `expires` should not be added
	
	i.setCookie(newCookie = { key: "a", value: "2", expires: new Date(1011) });
	+newCookie.expires === 1000; /// rounded down
	newCookie.stored === false; /// expiry check after rounding

	i.get() === ""; /// no cookies have been stored

	i.setCookie(newCookie = { key: "a", value: "3", expires: new Date(2010) });
	+newCookie.expires === 2000; /// rounded down
	newCookie.stored === true; /// 2000ms > 1000ms, so the cookie has not expired; it should be stored
	i.get() === "a=3"; /// cookie rendered

	i.date = new Date(2000);
	i.checkExpiry();
	newCookie.stored === false; /// with the rounded date, cookie has expired; should be removed

	i.setCookie(newCookie = { key: "a", value: "0.2", expires: 100 });
	newCookie.expires instanceof Date; /// expires number value converted to Date
	+newCookie.expires === 0; /// rouned down as usual

	i.get() === ""; /// cookie removed; no cookies should be rendered

	// cookie.maxAge
	i.setCookie(newCookie = { key: "b", value: "4", maxAge: 1 });
	newCookie.stored === true; /// future time; stored
	!("maxAge" in newCookie); /// `maxAge` property removed
	+newCookie.expires === 3000; /// 1 second past instance.date
	
	i.date = new Date(2001);
	i.setCookie(newCookie = { key: "b", value: "4.1", maxAge: 1 });
	+newCookie.expires === 3001; /// date not rounded
	newCookie.stored === true; ///  future date; added
	
	i.setCookie(newCookie = { key: "b", value: "4.2", maxAge: 0 });
	newCookie.stored === false; /// current date; expired
	
	i.setCookie(newCookie = { key: "b", value: "4.3", maxAge: -1 });
	newCookie.stored === false; /// past date; expired

	// instance.session
	var session = i.session = {};
	i.setCookie(newCookie = { key: "c", value: "5" });
	newCookie.expires === session; /// session cookie
	i.get() === "c=5"; /// cookie rendered
	
	i.session = {};
	i.get() === "c=5"; /// session changed, but expiry not checked
	
	i.checkExpiry();
	newCookie.stored === false; /// session expired; cookie removed
	i.get() === ""; /// cookie not rendered
	
	i.session = session;
	i.checkExpiry();
	i.get() === ""; /// removed cookies not revived

	i.setCookie(newCookie = { key: "c", value: "5" });
	i.get() === "c=5"; /// cookie added with current session
	
	i.expireSession(); // checks for expiry automatically
	newCookie.stored === false; /// cookie removed
	i.get() === ""; /// cookie not rendered

i = Cookie(); // documentObject
	typeof i.documentObject === "object"; /// object exists
	i.documentObject.cookie = "a=1";
	newCookie = i.cookies[0];
	(i.cookies.length === 1) && (newCookie.key === "a") && (newCookie.value === "1") && (newCookie.expires === i.session) && (newCookie.domain === i.domain) && (newCookie.path === i.path); /// cookie set correctly

	i.documentObject.cookie === "a=1"; /// getter value correct
	
var doc;
i = Cookie(doc = {});
	i.documentObject === doc; /// object exists
	doc.cookie = "a=1";
	newCookie = i.cookies[0];
	(i.cookies.length === 1) && (newCookie.key === "a") && (newCookie.value === "1") && (newCookie.expires === i.session) && (newCookie.domain === i.domain) && (newCookie.path === i.path); /// cookie set correctly

	doc.cookie === "a=1"; /// getter value correct

	i.domain = "example.com"; i.path = "/";
	date = new Date((date = new Date()).setFullYear(date.getFullYear() + 1));
	i.set("domain=" + i.domain + ";a=2;expires=" + date + ";path=" + i.path + ";ignored=data");
	newCookie = i.cookies[0];
	(i.cookies.length === 1) && (+newCookie.expires === date.setMilliseconds(0)) && (newCookie.path === i.path) && (newCookie.domain === i.domain) && (newCookie.key === "a") && (newCookie.value === "2"); /// documentObject.cookie setter added cookie correctly
	
} catch(_error) { console.log(_error.stack); }}) + ")()");

console.log(markup(result).replace(/\t/g, "    "));
