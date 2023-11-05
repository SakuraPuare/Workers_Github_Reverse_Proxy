# Workers_Github_Reverse_Proxy

## 引言

作为全球最大的代码托管平台之一，GitHub [[1]]在开发者社区中具有重要地位。稳定且快速的访问对开发过程至关重要。然而，在中国境内，GitHub的响应速度和访问稳定性问题一直困扰着开发者，可能导致访问代码仓库时出现多种连接问题。

通常，人们会采用网络代理服务（Network Proxy）[[2]]或虚拟私人网络（VPN ）[[3]]来提高GitHub的连接速度。然而，由于多种原因，这些方法在某些情况下可能同样存在连接不稳定等问题。此外，国内的代码托管平台如Gitee [[4]]等也被视为GitHub的替代选择。然而，这些平台可能缺乏全球范围内的开发者社区和资源，或者因安全考虑实施了各种限制政策，导致相对于GitHub的吸引力稍显不足。

在这一背景下，边缘计算技术 [[5]]为解决这一问题提供了新的可能性。作为一种新兴的分布式计算范式，边缘计算旨在将计算和数据处理尽可能地靠近数据源、终端用户和物联网设备，以提高计算资源的响应速度、降低延迟，并减轻中心化数据中心的负担。通过在物理世界的“边缘”执行计算，边缘计算架构已在多个应用领域取得显著成就。[[6]]

Cloudflare作为全球领先的网络性能和安全公司，在全球范围内部署的边缘节点和强大的技术实力，为边缘计算的发展注入了新的动力。[[7]]

## Cloudflare Workers

Cloudflare Workers充当边缘计算平台，为开发者提供了一个强大的工具，能够在遍布全球的边缘节点上执行代码，实现即时响应并降低延迟。这一过渡不仅填补了边缘计算在某些技术方面的不足，同时为开发者提供了更便捷和灵活的途径，以实现边缘计算的目标。此平台还提供了 Serverless 的执行环境，使您能够轻松创建新应用程序或扩展现有应用程序，而无需配置或维护基础设施。[[8]]

### 什么是无服务器（Serverless）计算？

无服务器计算是一种按需提供后端服务的方法。无服务器提供者允许用户编写和部署代码，而不必担心底层基础设施。从无服务器提供商获得后端服务的公司将根据计算量来付费，由于这种服务是自动扩展的，不必预留和付费购买固定数量的带宽或服务器。请注意，虽然名为“无服务器”，实际上仍然需要物理服务器，但开发人员不需要考虑服务器细节。

无服务器计算允许开发人员在灵活的“按需付费”的基础上购买后端服务，这意味着开发人员仅需为使用的服务付费。这类似于从每月固定限额的手机数据套餐切换到按实际使用的每个字节数据收费的套餐。

“无服务器”一词在某种程度上具有误导性，因为它仍然依赖服务器提供这些后端服务，但所有服务器空间和基础设施问题都由提供商处理。无服务器意味着开发人员可以完全不用担心服务器。[[9]]

### 为什么可以？

要实现以上目标，一个重要的前提是，我们连接到Cloudflare Workers的速度必须比连接到GitHub的速度更快，否则无论边缘计算技术的优势如何，其效果都将受到限制。中国的互联网架构与世界其他地区存在差异。在中国境内，用户访问位于境外的数据中心时可能会面临拥塞、数据丢失等问题，从而影响用户的使用体验。

为了优化在中国境内的内容交付，关键在于建立遍布各地、地理位置分散的数据中心，并与每个地区的主要互联网服务提供商（ISP）建立连接。这正是Cloudflare中国网络所提供的服务。Cloudflare与京东云展开合作，以扩展网络覆盖。截至目前，Cloudflare在中国大陆已建立了超过45个数据中心，遍布约30个城市。[[9]]

## 怎么开始

以下是Cloudflare Workers官方文档链接：

- [Cloudflare Workers · Cloudflare Workers docs](https://developers.cloudflare.com/workers/) [[8]]
- [Runtime APIs · Cloudflare Workers docs](https://developers.cloudflare.com/workers/runtime-apis/) [[10]]

### 梦开始的地方

```typescript
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request: Request) {
  return new Response('Hello worker!', {});
}
```
熟悉JavaScript的同学应该一眼就能看出，这段代码注册了一个`fetch`事件处理程序，当有请求到达时，程序将调用`handleRequest`函数处理请求，并返回一个包含`Hello worker!`内容的`Response`对象。

```javascript
addEventListener(type, listener): void
```
在Cloudflare中，`addEventListener`函数用于定义Workers处理请求的监听器。目前有三种监听器类型，我们只需要使用`fetch`类型。如果注册了多个`fetch`监听器，当一个监听器没有调用`event.respondWith()`时，事件将被传递给下一个注册的监听器。

- `fetch`：当请求到达时触发
- `scheduled`：定时触发
- `queue`：队列触发

### 处理请求

要实现页面的反向代理，我们只需解析用户的请求，然后将请求发送到相应的目标服务器，最后将响应返回给客户端。

```typescript
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request: Request) {
  const url = new URL(request.url);
  url.host = 'github.com';
  const newRequest = new Request(url.toString(), request);
  return fetch(newRequest);
}
```
通过解析用户的请求，我们可以获得用户访问的URL。其中，`request.url`返回用户请求的URL字符串。我们可以构造一个`URL`对象来解析其中的信息。

URL 接口用于解析，构造，规范化和编码 URL。它通过提供允许您轻松阅读和修改 URL 组件的属性来工作。通常，通过在调用 URL 的构造函数时将 URL 指定为字符串或提供相对 URL 和基本 URL 来创建新的 URL 对象。然后，您可以轻松读取 URL 的已解析组成部分或对 URL 进行更改。[[11]]

我们可以通过修改`url.host`来修改用户请求的目标服务器，然后构造一个新的请求对象`newRequest`，将其发送到目标服务器。最后，将目标服务器返回的响应返回给客户端即可。

这样，我们就完成了一个简单的反向代理。

![file](https://blog.sakurapuare.com/wp-content/uploads/2023/03/image-1691295829095.png)

### 还有点问题

尽管我们已经实现了一个简单的反向代理，但仍然存在一些问题。例如，页面中存在许多链接，这些链接指向GitHub，而不是我们的反向代理。这会导致一个问题，即当用户点击这些链接时，他们会被重定向回GitHub，而不是我们的反向代理（例如左上角的GitHub Logo）。

![file](https://blog.sakurapuare.com/wp-content/uploads/2023/03/image-1691296063348.png)

为解决这个问题，我们需要修改页面中的链接，使其指向我们的反向代理。这涉及解析页面，然后修改其中的链接。

一种选择是使用HTMLRewriter，它允许开发人员在 Cloudflare Workers 应用程序内部构建全面且富有表现力的 HTML 解析器。它可以被视为直接位于 Workers 应用程序内部的类似于 jQuery 的体验。依靠强大的 JavaScript API 来解析和转换 HTML，HTMLRewriter 允许开发人员构建功能强大的应用程序。[[12]] 但是，此方法仅能修改 HTML 中的链接，无法修改 JavaScript 或返回 JSON 中的链接。因此，使用正则表达式解析页面并修改链接可能是更好的选择。

```typescript
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request: Request) {
  const url = new URL(request.url);
  url.host = 'github.com';
  const newRequest = new Request(url.toString(), request);
  let newResponse = await fetch(newRequest);
  if (newResponse.body &&
    newResponse.headers.get('content-type')?.includes('text') ||
    newResponse.headers.get('content-type')?.includes('application/json')) {
    let newBody = await newResponse.text();
    newBody = newBody.replace(/\/(www.)?github\\.com/g, '\/github.sakurapuare.com');
    newResponse = new Response(newBody, newResponse);
  }
  return newResponse;
}
```
相较于上述代码，我们首先通过`fetch(newRequest)`获取返回的响应。然后，我们检查响应的`content-type`，只有在类型为`text`或`application/json`时，才对其进行解析。[[13]] 随后，我们使用正则表达式将页面中的链接修改为指向我们的反向代理链接，并构建一个新的`Response`对象返回给客户端。

![file](https://blog.sakurapuare.com/wp-content/uploads/2023/03/image-1691297537761.png)

### 谨防网络爬虫

在上述代码中，我们对所有请求都进行了处理，一切看起来很好。然而，我们还需要考虑一种情况，即网络爬虫。网络爬虫是一种用于浏览万维网内容的自动化程序，通常定期抓取网站内容以在搜索引擎中建立索引。[[14]]

但这并不是我们所期望的，因为我们的网站只是GitHub的反向代理，不希望被搜索引擎收录。为此，我们需要屏蔽网络爬虫。

这时，`robots.txt`文件就派上用场了。`robots.txt`是一个文本文件，网站管理员可以在其中指定哪些网页可以被网络爬虫访问，哪些网页不能被网络爬虫访问。[[15]]

为避免网络爬虫，我们可以模拟一个`robots.txt`文件，然后将其返回给网络爬虫。以下是一个`robots.txt`文件示例，指示网络爬虫不要访问任何页面。

```text
User-agent: *
Disallow: /
```

我们可以读取用户访问的`pathname`，然后判断是否为`robots.txt`，如果是，则返回上面的内容。否则，我们就对用户的请求进行处理。

```typescript
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request: Request) {
  const url = new URL(request.url);
  const {pathname} = url;
  if (pathname === '/robots.txt') {
    return new Response('User-agent: *\nDisallow: /', {
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
      },
    });
  }
  url.host = 'github.com';
  const newRequest = new Request(url.toString(), request);
  let newResponse = await fetch(newRequest);
  if (newResponse.body &&
    newResponse.headers.get('content-type')?.includes('text') ||
    newResponse.headers.get('content-type')?.includes('application/json')) {
    let newBody = await newResponse.text();
    newBody = newBody.replace(/\/(www.)?github\\.com/g, '\/github.sakurapuare.com');
    newResponse = new Response(newBody, newResponse);
  }
  return newResponse;
}
```

![file](https://blog.sakurapuare.com/wp-content/uploads/2023/03/image-1691298559250.png)

需要注意，尽管`robots.txt`中使用了“允许”和“禁止”术语，但该协议纯粹是建议性的，取决于网络爬虫是否遵守；它不能强制执行文件中的任何状态。恶意网络爬虫可能不会遵守`robots.txt`，有些人甚至可能使用`robots.txt`作为指南来查找不允许的链接并直接访问。

为进一步防范，还可以结合Cloudflare的各种服务进行屏蔽，这里不再赘述。

## Show me the Code

所有部署Workers需要的源代码已在[Github](https://github.com/SakuraPuare/Workers_Github_Reverse_Proxy "Github")开源

[github author="SakuraPuare" project="Workers_Github_Reverse_Proxy"][/github]

## TS;WR (Too Short; Want Read)

直接使用吧 -> **[免费Github加速反向代理](https://blog.sakurapuare.com/archives/2023/06/github_proxy/)**

## 参考资料

- [1] [GitHub: Let's build from here · GitHub](https://github.com/)
- [2] [Proxy server - Wikipedia](https://en.wikipedia.org/wiki/Proxy_server)
- [3] [Virtual private network - Wikipedia](https://en.wikipedia.org/wiki/Virtual_private_network)
- [4] [Gitee - 企业级 DevOps 研发效能平台](https://gitee.com/)
- [5] [Edge computing - Wikipedia](https://en.wikipedia.org/wiki/Edge_computing)
- [6] [【文献检索】边缘计算技术及应用综述【杂谈】](https://blog.sakurapuare.com/archives/2022/12/a-review-of-technology-and-application-on-edge-computing/)
- [7] [Cloudflare 中国官网 | 智能化云服务平台 | 免费CDN安全防护 | Cloudflare](https://www.cloudflare.com/zh-cn/)
- [8] [Cloudflare Workers · Cloudflare Workers docs](https://developers.cloudflare.com/workers/)
- [9] [什么是无服务器计算_什么是后端服务_Cloudflare中国官网 | Cloudflare](https://www.cloudflare.com/zh-cn/learning/serverless/what-is-serverless/)
- [10] [中国网络性能安全服务 | Cloudflare 中国官网 | Cloudflare](https://www.cloudflare.com/zh-cn/application-services/products/china-network/)
- [11] [Runtime APIs · Cloudflare Workers docs](https://developers.cloudflare.com/workers/runtime-apis/)
- [12] [URL - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/URL)
- [13] [HTMLRewriter · Cloudflare Workers docs](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter)
- [14] [MIME types - HTTP | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)
- [15] [Web crawler - Wikipedia](https://en.wikipedia.org/wiki/Web_crawler)
- [16] [robots.txt - Wikipedia](https://en.wikipedia.org/wiki/Robots.txt)

[[1]]: <https://github.com/> "GitHub: Let's build from here · GitHub"
[[2]]: <https://en.wikipedia.org/wiki/Proxy_server> "Proxy server - Wikipedia"
[[3]]: <https://en.wikipedia.org/wiki/Virtual_private_network> "Virtual private network - Wikipedia"
[[4]]: <https://gitee.com/> "Gitee - 企业级 DevOps 研发效能平台"
[[5]]: <https://en.wikipedia.org/wiki/Edge_computing> "Edge computing - Wikipedia"
[[6]]: <https://blog.sakurapuare.com/archives/2022/12/a-review-of-technology-and-application-on-edge-computing/> "【文献检索】边缘计算技术及应用综述【杂谈】"
[[7]]: <https://www.cloudflare.com/zh-cn/> "Cloudflare 中国官网 | 智能化云服务平台 | 免费CDN安全防护 | Cloudflare"
[[8]]: <https://developers.cloudflare.com/workers/> "Cloudflare Workers · Cloudflare Workers docs"
[[9]]: <https://www.cloudflare.com/zh-cn/learning/serverless/what-is-serverless/> "什么是无服务器计算_什么是后端服务_Cloudflare中国官网 | Cloudflare"
[[9]]: <https://www.cloudflare.com/zh-cn/application-services/products/china-network/> "中国网络性能安全服务 | Cloudflare 中国官网 | Cloudflare"
[[10]]: <https://developers.cloudflare.com/workers/runtime-apis/> "Runtime APIs · Cloudflare Workers docs"
[[11]]: <https://developer.mozilla.org/en-US/docs/Web/API/URL> "URL - Web APIs | MDN"
[[12]]: <https://developers.cloudflare.com/workers/runtime-apis/html-rewriter> "HTMLRewriter · Cloudflare Workers docs"
[[13]]: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types> "MIME types - HTTP | MDN"
[[14]]: <https://en.wikipedia.org/wiki/Web_crawler> "Web crawler - Wikipedia"
[[15]]: <https://en.wikipedia.org/wiki/Robots.txt> "robots.txt - Wikipedia"


## 节点

- github.com/ -> [github.sakurapuare.com/](https://github.sakurapuare.com "github.sakurapuare.com")
- api.github.com/ -> [github-api.sakurapuare.com/](https://github-api.sakurapuare.com "github-api.sakurapuare.com")
- \*.githubusercontent.com -> [github-usercontent.sakurapuare.com/\*/](https://github-usercontent.sakurapuare.com/ "github-usercontent.sakurapuare.com/\*/")
- \*.githubassets.com -> [github-assets.sakurapuare.com/\*/](https://github-assets.sakurapuare.com "github-assets.sakurapuare.com/\*/")

## 使用方法

对于没有通配符的网站，直接访问即可。

对于有通配符的网站，需要将三级域名添加到路径后访问。

```text
https://raw.githubusercontent.com/SakuraPuare/Workers_Github_Reverse_Proxy/master/README.md
```

如上，此网址的三级域名为`raw`，则需要将其添加到路径中：

```text
https://github-usercontent.sakurapuare.com/raw/SakuraPuare/Workers_Github_Reverse_Proxy/master/README.md
```

即可访问

## 参考

[github author="SakuraPuare" project="Workers_Github_Reverse_Proxy"][/github]

**[基于Cloudflare Workers的Github反向代理【JavaScript】](https://blog.sakurapuare.com/archives/2023/03/cloudflare_worker_based_github_reverse_proxy)**

