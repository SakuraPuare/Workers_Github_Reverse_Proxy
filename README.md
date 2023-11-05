# Workers_Github_Reverse_Proxy
 
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

