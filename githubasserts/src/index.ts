const upstream = 'githubassets.com';

addEventListener('fetch', (event: FetchEvent) => {
	event.respondWith(handleRequest(event.request));
});

async function handleRequest(request: Request): Promise<Response> {
	// redirect http to https
	const url = new URL(request.url);
	// if (url.protocol === 'http:') {
	//   url.protocol = 'https:';
	//   return Response.redirect(url.href, 301);
	// }

	// /robots.txt
	if (url.pathname === '/robots.txt') {
		return new Response('User-agent: *\nDisallow: /\nDisallow: /*', {
			headers: {
				'content-type': 'text/plain;charset=UTF-8',
			},
		});
	}
	return await getUpstreamResponse(request);
}

async function getUpstreamResponse(request: Request) {
	const rawURL = new URL(request.url);
	const pathname = rawURL.pathname.split('/');
	// console.log(pathname)
	let url, domain, remain;
	if (pathname.length == 2) {
		// 404
		return new Response('404 Not Found', {
			status: 404,
			statusText: 'Not Found',
			headers: {
				'content-type': 'text/plain;charset=UTF-8',
			},
		});
	}
	else {
		domain = pathname[1];
		remain = pathname.slice(2).join('/');
		url = new URL(`/${remain}`, `https://${domain}.${upstream}/`);
	}
	// console.log(url);
	url.port = '443';
	url.protocol = 'https:';
	const headers = new Headers(request.headers);
	headers.set('Host', url.host);
	headers.set('Referer', url.href);
	// cross origin
	headers.set('Access-Control-Allow-Origin', '*');
	headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
	headers.set('Access-Control-Allow-Headers', 'Content-Type');
	headers.set('Access-Control-Allow-Credentials', 'true');

	if (request.headers.has('Origin')) {
		headers.set('Origin', url.href);
	}

	let response: Response;
	if (request.bodyUsed) {
		response = await fetch(url.href, {
			method: request.method,
			headers: headers,
			body: request.body,
		});
	}
	else {
		response = await fetch(url.href, {
			method: request.method,
			headers: headers,
		});
	}

	const responseHeaders = new Headers(response?.headers);
	responseHeaders.delete('Content-Security-Policy');
	responseHeaders.delete('Content-Security-Policy-Report-Only');
	responseHeaders.delete('Clear-Site-Data');

	if (response.body && responseHeaders.has('Content-type')) {
		const content_type = responseHeaders.get('Content-type')?.toLowerCase();
		if (content_type.includes('text') || content_type.includes('application') || content_type.includes('json')) {
			const replaceReg: Array<Object> = await github.get('json', { type: "json" });
			let text = await response.text();
			replaceReg.forEach((item: any) => {
				text = text.replace(new RegExp(item.reg, 'g'), item.replace);
			});
			return new Response(text, {
				status: response.status,
				statusText: response.statusText,
				headers: responseHeaders,
			});
		}
		else {
			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers: responseHeaders,
			});
		}
	}
	// return new Response('Hello world!');
}
