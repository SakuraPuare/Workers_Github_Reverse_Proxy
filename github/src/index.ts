const upstream = 'github.com';

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
  const url = new URL(request.url);
  url.host = upstream;
  url.port = '443';
  url.protocol = 'https:';
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Host', url.host);
  requestHeaders.set('Referer', url.href);
  // cross origin
  requestHeaders.set('Access-Control-Allow-Origin', '*');
  requestHeaders.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  requestHeaders.set('Access-Control-Allow-Headers', 'Content-Type');
  requestHeaders.set('Access-Control-Allow-Credentials', 'true');

  if (request.headers.has('Origin')) {
    requestHeaders.set('Origin', url.href);
  }

  let response: Response;
  if (request.bodyUsed) {
    response = await fetch(url.href, {
      method: request.method,
      headers: requestHeaders,
      body: request.body,
    });
  }
  else {
    response = await fetch(url.href, {
      method: request.method,
      headers: requestHeaders,
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