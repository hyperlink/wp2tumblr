function deparam(search) {
	var ret = {},
		seg = search.replace(/^\?/,'').split('&'),
		len = seg.length, i = 0, s;
	for (;i<len;i++) {
		if (!seg[i]) { continue; }
		s = seg[i].split('=');
		ret[s[0]] = s[1];
	}
	return ret;
}

exports.parseURL = parseURL
function parseURL(url) {
	var a =  document.createElement('a');
	a.href = url;
	return {
		source: url,
		protocol: a.protocol.replace(':',''),
		host: a.hostname,
		port: a.port,
		query: a.search,
		params: deparam(a.search),
		hash: a.hash.replace('#',''),
		path: a.pathname.replace(/^([^\/])/,'/$1'),
		// Browserify complains about these two
		// file_path: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
		// relative_path: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
		segments: a.pathname.replace(/^\//,'').split('/')
	};
}