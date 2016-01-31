var test = module.exports = {
	catch: function(action) { var e; try { action(); } catch(_e) { e = _e; } return e; },
	
	similar: function(a, b, depth) {
		
	},
	arrayCompare: function(a, b, depth) {
		var l;
		if ((l = a.length) !== b.length) { return false; }
		for (var i = 0; i < l; i++) {
			if (a[i] !== b[i]) {
				if (!depth || !test.similar(a[i], b[i], depth - 1)) {
					return false;
				}
			}
		}
		
		return true;
	}
};