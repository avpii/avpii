var __assign2 = Object.assign;
import {r as reactive, m as markRaw, n as nextTick, i as inject, a as ref, b as readonly, w as watchEffect, o as onMounted, c as onUpdated, d as onUnmounted, h, p as pushScopeId, e as popScopeId, f as openBlock, g as createBlock, j as createVNode, k as withScopeId, l as renderSlot, q as resolveDynamicComponent, s as resolveComponent, t as withCtx, u as computed, F as Fragment, v as renderList, x as toDisplayString, y as createTextVNode, z as createCommentVNode, A as mergeProps, B as toRefs, C as withKeys, D as provide, E as createSSRApp} from "./common-233afa50.js";
const RouterSymbol = Symbol();
const fakeHost = `http://a.com`;
const getDefaultRoute = () => ({
  path: "/",
  contentComponent: null
});
function createRouter(loadComponent, fallbackComponent) {
  const route = reactive(getDefaultRoute());
  const inBrowser2 = typeof window !== "undefined";
  function go(href) {
    href = href || (inBrowser2 ? location.href : "/");
    const url = new URL(href, fakeHost);
    if (!url.pathname.endsWith("/") && !url.pathname.endsWith(".html")) {
      url.pathname += ".html";
      href = url.href;
    }
    if (inBrowser2) {
      history.replaceState({scrollPosition: window.scrollY}, document.title);
      history.pushState(null, "", href);
    }
    return loadPage(href);
  }
  async function loadPage(href, scrollPosition = 0) {
    const targetLoc = new URL(href, fakeHost);
    const pendingPath = route.path = targetLoc.pathname;
    try {
      let comp = loadComponent(route);
      if ("then" in comp && typeof comp.then === "function") {
        comp = await comp;
      }
      if (route.path === pendingPath) {
        if (!comp) {
          throw new Error(`Invalid route component: ${comp}`);
        }
        route.contentComponent = markRaw(comp);
        if (inBrowser2) {
          nextTick(() => {
            if (targetLoc.hash && !scrollPosition) {
              const target = document.querySelector(targetLoc.hash);
              if (target) {
                scrollTo(target, targetLoc.hash);
                return;
              }
            }
            window.scrollTo(0, scrollPosition);
          });
        }
      }
    } catch (err) {
      if (!err.message.match(/fetch/)) {
        console.error(err);
      }
      if (route.path === pendingPath) {
        route.contentComponent = fallbackComponent ? markRaw(fallbackComponent) : null;
      }
    }
  }
  if (inBrowser2) {
    window.addEventListener("click", (e) => {
      const link2 = e.target.closest("a");
      if (link2) {
        const {href, protocol, hostname, pathname, hash, target} = link2;
        const currentUrl = window.location;
        if (target !== `_blank` && protocol === currentUrl.protocol && hostname === currentUrl.hostname) {
          e.preventDefault();
          if (pathname === currentUrl.pathname) {
            if (hash && hash !== currentUrl.hash) {
              history.pushState(null, "", hash);
              scrollTo(link2, hash, link2.classList.contains("header-anchor"));
            }
          } else {
            go(href);
          }
        }
      }
    }, {capture: true});
    window.addEventListener("popstate", (e) => {
      loadPage(location.href, e.state && e.state.scrollPosition || 0);
    });
    window.addEventListener("hashchange", (e) => {
      e.preventDefault();
    });
  }
  return {
    route,
    go
  };
}
function useRouter() {
  const router = inject(RouterSymbol);
  if (!router) {
    throw new Error("useRouter() is called without provider.");
  }
  return router;
}
function useRoute() {
  return useRouter().route;
}
function scrollTo(el, hash, smooth = false) {
  const pageOffset = document.getElementById("app").offsetTop;
  const target = el.classList.contains(".header-anchor") ? el : document.querySelector(hash);
  if (target) {
    const targetTop = target.offsetTop - pageOffset - 15;
    if (!smooth || Math.abs(targetTop - window.scrollY) > window.innerHeight) {
      window.scrollTo(0, targetTop);
    } else {
      window.scrollTo({
        left: 0,
        top: targetTop,
        behavior: "smooth"
      });
    }
  }
}
var serialized = '{"title":"Aljona Piispanen","description":"My portfolio site: illustrations and artworks","base":"/","head":[["meta",{"name":"viewport","content":"width=device-width, initial-scale=1"}],["link",{"rel":"stylesheet","href":"https://fonts.googleapis.com/icon?family=Material+Icons"}]],"themeConfig":{"form":{"action":"https://formspree.io/al.piispanen@gmail.com"},"socials":{"twitter":"https://twitter.com/AlPiispanen","behance":"https://www.behance.net/alaineenchanted","instagram":"https://www.instagram.com/aljona_piispanen/","dribble":"https://dribbble.com/piispanen","gmail":"mailto:al.piispanen@gmail.com"},"nav":[{"text":"Home","link":"/"},{"text":"Illustrations","link":"/illustrations/"},{"text":"Digital Sketching","link":"/sketches/"},{"text":"Animations","link":"/animations/"},{"text":"Series & projects","link":"/work/"},{"text":"Contact","link":"/contact/"}]}}';
const parse = (data2) => readonly(JSON.parse(data2));
const siteDataRef = ref(parse(serialized));
function useSiteData() {
  return siteDataRef;
}
function useUpdateHead(pageDataRef) {
  const metaTags = Array.from(document.querySelectorAll("meta"));
  let isFirstUpdate = true;
  const updateHeadTags = (newTags) => {
    if (isFirstUpdate) {
      isFirstUpdate = false;
      return;
    }
    metaTags.forEach((el) => document.head.removeChild(el));
    metaTags.length = 0;
    if (newTags && newTags.length) {
      newTags.forEach((headConfig) => {
        const el = createHeadElement(headConfig);
        document.head.appendChild(el);
        metaTags.push(el);
      });
    }
  };
  watchEffect(() => {
    const pageData = pageDataRef.value;
    const siteData = siteDataRef.value;
    const pageTitle = pageData && pageData.title;
    document.title = (pageTitle ? pageTitle + ` | ` : ``) + siteData.title;
    updateHeadTags([
      [
        "meta",
        {
          name: "description",
          content: siteData.description
        }
      ],
      ...siteData.head,
      ...pageData && pageData.frontmatter.head || []
    ]);
  });
}
function createHeadElement([tag, attrs, innerHTML]) {
  const el = document.createElement(tag);
  for (const key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
  if (innerHTML) {
    el.innerHTML = innerHTML;
  }
  return el;
}
const pageDataSymbol = Symbol();
function usePageData() {
  const data2 = inject(pageDataSymbol);
  if (!data2) {
    throw new Error("usePageData() is called without provider.");
  }
  return data2;
}
const inBrowser = typeof window !== "undefined";
function pathToFile(path) {
  let pagePath = path.replace(/\.html$/, "");
  if (pagePath.endsWith("/")) {
    pagePath += "index";
  }
  {
    if (inBrowser) {
      const base = "/";
      pagePath = pagePath.slice(base.length).replace(/\//g, "_") + ".md";
      const pageHash = __VP_HASH_MAP__[pagePath];
      pagePath = `${base}_assets/${pagePath}.${pageHash}.js`;
    } else {
      pagePath = `./${pagePath.slice(1).replace(/\//g, "_")}.md.js`;
    }
  }
  return pagePath;
}
const hasFetched = new Set();
const createLink = () => document.createElement("link");
const viaDOM = (url) => {
  const link2 = createLink();
  link2.rel = `prefetch`;
  link2.href = url;
  document.head.appendChild(link2);
};
const viaXHR = (url) => {
  const req = new XMLHttpRequest();
  req.open("GET", url, req.withCredentials = true);
  req.send();
};
let link;
const doFetch = inBrowser && (link = createLink()) && link.relList && link.relList.supports && link.relList.supports("prefetch") ? viaDOM : viaXHR;
function usePrefetch() {
  if (!inBrowser) {
    return;
  }
  if (!window.IntersectionObserver) {
    return;
  }
  let conn;
  if ((conn = navigator.connection) && (conn.saveData || /2g/.test(conn.effectiveType))) {
    return;
  }
  const rIC = window.requestIdleCallback || setTimeout;
  let observer = null;
  const observeLinks = () => {
    if (observer) {
      observer.disconnect();
    }
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const link2 = entry.target;
          observer.unobserve(link2);
          const {pathname} = link2;
          if (!hasFetched.has(pathname)) {
            hasFetched.add(pathname);
            const pageChunkPath = pathToFile(pathname);
            doFetch(pageChunkPath);
          }
        }
      });
    });
    rIC(() => {
      document.querySelectorAll(".vitepress-content a").forEach((link2) => {
        const {target, hostname, pathname} = link2;
        if (target !== `_blank` && hostname === location.hostname) {
          if (pathname !== location.pathname) {
            observer.observe(link2);
          } else {
            hasFetched.add(pathname);
          }
        }
      });
    });
  };
  onMounted(observeLinks);
  onUpdated(observeLinks);
  onUnmounted(() => {
    observer && observer.disconnect();
  });
}
const Content = {
  setup() {
    const route = useRoute();
    {
      usePrefetch();
    }
    return () => route.contentComponent ? h(route.contentComponent) : null;
  }
};
;
var script = {
  props: {image: String}
};
const _withId = /* @__PURE__ */ withScopeId("data-v-0c564fc4");
pushScopeId("data-v-0c564fc4");
const _hoisted_1 = {class: "hero"};
const _hoisted_2 = {class: "inner"};
popScopeId();
const render = /* @__PURE__ */ _withId(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createBlock("div", _hoisted_1, [
    createVNode("div", _hoisted_2, [
      createVNode("img", {
        class: "image",
        src: _ctx.image
      }, null, 8, ["src"])
    ])
  ]);
});
;
script.render = render;
script.__scopeId = "data-v-0c564fc4";
var script$1 = {
  props: {tag: {default: "button"}}
};
const _withId$1 = /* @__PURE__ */ withScopeId("data-v-64889100");
const render$1 = /* @__PURE__ */ _withId$1(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createBlock(resolveDynamicComponent(_ctx.tag), {class: "button"}, {
    default: _withId$1(() => [
      renderSlot(_ctx.$slots, "default")
    ]),
    _: 3
  });
});
;
script$1.render = render$1;
script$1.__scopeId = "data-v-64889100";
var script$2 = {
  components: {ButtonBase: script$1},
  props: {to: {default: "#"}}
};
function render$2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_ButtonBase = resolveComponent("ButtonBase");
  return openBlock(), createBlock(_component_ButtonBase, {
    tag: "a",
    href: _ctx.to
  }, {
    default: withCtx(() => [
      renderSlot(_ctx.$slots, "default")
    ]),
    _: 3
  }, 8, ["href"]);
}
script$2.render = render$2;
const _hoisted_1$1 = {
  role: "img",
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg"
};
const _hoisted_2$1 = /* @__PURE__ */ createVNode("title", null, "Twitter icon", -1);
const _hoisted_3 = /* @__PURE__ */ createVNode("path", {d: "M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"}, null, -1);
function render$3(_ctx, _cache) {
  return openBlock(), createBlock("svg", _hoisted_1$1, [
    _hoisted_2$1,
    _hoisted_3
  ]);
}
const script$3 = {};
script$3.render = render$3;
const _hoisted_1$2 = {
  role: "img",
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg"
};
const _hoisted_2$2 = /* @__PURE__ */ createVNode("title", null, "Behance icon", -1);
const _hoisted_3$1 = /* @__PURE__ */ createVNode("path", {d: "M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.61.165-1.252.254-1.91.254H0V4.51h6.938v-.007zM16.94 16.665c.44.428 1.073.643 1.894.643.59 0 1.1-.148 1.53-.447.424-.29.68-.61.78-.94h2.588c-.403 1.28-1.048 2.2-1.9 2.75-.85.56-1.884.83-3.08.83-.837 0-1.584-.13-2.272-.4-.673-.27-1.24-.65-1.72-1.14-.464-.49-.823-1.08-1.077-1.77-.253-.69-.373-1.45-.373-2.27 0-.803.135-1.54.403-2.23.27-.7.644-1.28 1.12-1.79.495-.51 1.063-.895 1.736-1.194s1.4-.433 2.22-.433c.91 0 1.69.164 2.38.523.67.34 1.22.82 1.66 1.4.44.586.75 1.26.94 2.02.19.75.25 1.54.21 2.38h-7.69c0 .84.28 1.632.71 2.065l-.08.03zm-10.24.05c.317 0 .62-.03.906-.093.29-.06.548-.165.763-.3.21-.135.39-.328.52-.583.13-.24.19-.57.19-.96 0-.75-.22-1.29-.64-1.62-.43-.32-.99-.48-1.69-.48H3.24v4.05H6.7v-.03zm13.607-5.65c-.352-.385-.94-.592-1.657-.592-.468 0-.855.074-1.166.238-.302.15-.55.35-.74.59-.19.24-.317.48-.392.75-.075.26-.12.5-.135.71h4.762c-.07-.75-.33-1.3-.68-1.69v.01zM6.52 10.45c.574 0 1.05-.134 1.425-.412.374-.27.554-.72.554-1.338 0-.344-.07-.625-.18-.846-.13-.22-.3-.39-.5-.512-.21-.124-.45-.21-.72-.257-.27-.053-.56-.074-.84-.074H3.23v3.44h3.29zm9.098-4.958h5.968v1.454h-5.968V5.48v.01z"}, null, -1);
function render$4(_ctx, _cache) {
  return openBlock(), createBlock("svg", _hoisted_1$2, [
    _hoisted_2$2,
    _hoisted_3$1
  ]);
}
const script$4 = {};
script$4.render = render$4;
const _hoisted_1$3 = {
  role: "img",
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg"
};
const _hoisted_2$3 = /* @__PURE__ */ createVNode("title", null, "Instagram icon", -1);
const _hoisted_3$2 = /* @__PURE__ */ createVNode("path", {d: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"}, null, -1);
function render$5(_ctx, _cache) {
  return openBlock(), createBlock("svg", _hoisted_1$3, [
    _hoisted_2$3,
    _hoisted_3$2
  ]);
}
const script$5 = {};
script$5.render = render$5;
const _hoisted_1$4 = {
  role: "img",
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg"
};
const _hoisted_2$4 = /* @__PURE__ */ createVNode("title", null, "Dribbble icon", -1);
const _hoisted_3$3 = /* @__PURE__ */ createVNode("path", {d: "M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z"}, null, -1);
function render$6(_ctx, _cache) {
  return openBlock(), createBlock("svg", _hoisted_1$4, [
    _hoisted_2$4,
    _hoisted_3$3
  ]);
}
const script$6 = {};
script$6.render = render$6;
const _hoisted_1$5 = {
  role: "img",
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg"
};
const _hoisted_2$5 = /* @__PURE__ */ createVNode("title", null, "Gmail icon", -1);
const _hoisted_3$4 = /* @__PURE__ */ createVNode("path", {d: "M24 4.5v15c0 .85-.65 1.5-1.5 1.5H21V7.387l-9 6.463-9-6.463V21H1.5C.649 21 0 20.35 0 19.5v-15c0-.425.162-.8.431-1.068C.7 3.16 1.076 3 1.5 3H2l10 7.25L22 3h.5c.425 0 .8.162 1.069.432.27.268.431.643.431 1.068z"}, null, -1);
function render$7(_ctx, _cache) {
  return openBlock(), createBlock("svg", _hoisted_1$5, [
    _hoisted_2$5,
    _hoisted_3$4
  ]);
}
const script$7 = {};
script$7.render = render$7;
var script$8 = {
  props: {name: String},
  setup() {
    return {
      components: markRaw({
        twitter: script$3,
        behance: script$4,
        instagram: script$5,
        dribble: script$6,
        gmail: script$7
      })
    };
  }
};
const _withId$2 = /* @__PURE__ */ withScopeId("data-v-40d69d54");
const render$8 = /* @__PURE__ */ _withId$2(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createBlock(resolveDynamicComponent(_ctx.components[_ctx.name]), {class: "svg-icon"});
});
;
script$8.render = render$8;
script$8.__scopeId = "data-v-40d69d54";
var script$9 = {
  components: {
    LinkButton: script$2,
    SVGIcon: script$8
  },
  setup() {
    const site = useSiteData();
    return {
      socials: computed(() => site.value.themeConfig.socials)
    };
  }
};
const _withId$3 = /* @__PURE__ */ withScopeId("data-v-2c4e710c");
pushScopeId("data-v-2c4e710c");
const _hoisted_1$6 = {class: "socials"};
popScopeId();
const render$9 = /* @__PURE__ */ _withId$3(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_SVGIcon = resolveComponent("SVGIcon");
  const _component_LinkButton = resolveComponent("LinkButton");
  return openBlock(), createBlock("div", _hoisted_1$6, [
    (openBlock(true), createBlock(Fragment, null, renderList(_ctx.socials, (item, key) => {
      return openBlock(), createBlock(_component_LinkButton, {
        key,
        class: "social-btn round icon",
        target: "blank",
        to: item
      }, {
        default: _withId$3(() => [
          createVNode(_component_SVGIcon, {name: key}, null, 8, ["name"])
        ]),
        _: 2
      }, 1032, ["to"]);
    }), 128))
  ]);
});
;
script$9.render = render$9;
script$9.__scopeId = "data-v-2c4e710c";
var script$a = {
  components: {Hero: script, LinkButton: script$2, Socials: script$9},
  setup() {
    const page = usePageData();
    return {
      hero: computed(() => page.value.frontmatter.hero)
    };
  }
};
const _withId$4 = /* @__PURE__ */ withScopeId("data-v-91e35852");
pushScopeId("data-v-91e35852");
const _hoisted_1$7 = {class: "home"};
const _hoisted_2$6 = {class: "content"};
const _hoisted_3$5 = {class: "hero-text"};
const _hoisted_4 = {class: "text-block"};
popScopeId();
const render$a = /* @__PURE__ */ _withId$4(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_Hero = resolveComponent("Hero");
  const _component_Content = resolveComponent("Content");
  const _component_LinkButton = resolveComponent("LinkButton");
  const _component_Socials = resolveComponent("Socials");
  return openBlock(), createBlock("div", _hoisted_1$7, [
    createVNode(_component_Hero, {
      class: "home-hero",
      image: _ctx.hero.image
    }, null, 8, ["image"]),
    createVNode("div", _hoisted_2$6, [
      createVNode("h1", _hoisted_3$5, toDisplayString(_ctx.hero.title), 1),
      createVNode("div", _hoisted_4, [
        createVNode(_component_Content)
      ]),
      createVNode(_component_LinkButton, {
        to: _ctx.hero.button.link,
        class: "portfolio-btn primary"
      }, {
        default: _withId$4(() => [
          createTextVNode(toDisplayString(_ctx.hero.button.caption), 1)
        ]),
        _: 1
      }, 8, ["to"]),
      createVNode(_component_Socials, {class: "hero-socials"})
    ])
  ]);
});
;
script$a.render = render$a;
script$a.__scopeId = "data-v-91e35852";
var script$b = {
  props: {items: {default: () => []}, columns: {default: void 0}}
};
const _withId$5 = /* @__PURE__ */ withScopeId("data-v-6dca8c50");
pushScopeId("data-v-6dca8c50");
const _hoisted_1$8 = {class: "bg"};
const _hoisted_2$7 = {class: "content"};
popScopeId();
const render$b = /* @__PURE__ */ _withId$5(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createBlock("div", {
    class: ["items-grid", _ctx.columns && `columns-${_ctx.columns}`]
  }, [
    (openBlock(true), createBlock(Fragment, null, renderList(_ctx.items, (item, index2) => {
      return openBlock(), createBlock("a", {
        key: item,
        class: "grid-item",
        href: item
      }, [
        createVNode("div", _hoisted_1$8, [
          renderSlot(_ctx.$slots, "bg", {item, index: index2})
        ]),
        createVNode("div", _hoisted_2$7, [
          renderSlot(_ctx.$slots, "content", {item, index: index2})
        ])
      ], 8, ["href"]);
    }), 128))
  ], 2);
});
;
script$b.render = render$b;
script$b.__scopeId = "data-v-6dca8c50";
var serialized$1 = '{"/404.html":{"title":"Not found","frontmatter":{"title":"Not found","type":"NotFound"},"lastUpdated":1595105761233.0308},"/":{"title":"Home","frontmatter":{"title":"Home","type":"Home","hero":{"title":"Aljona Piispanen","image":"/assets/hero-image.png","button":{"link":"/illustrations/","caption":"Portfolio"}}},"lastUpdated":1595105761233.0308},"/animations/":{"title":"Animations","frontmatter":{"title":"Animations","type":"Posts","columns":1},"lastUpdated":1595105761233.0308},"/contact/":{"title":"Contact","frontmatter":{"title":"Contact","type":"Contact","columns":1},"lastUpdated":1595105761233.0308},"/illustrations/":{"title":"Illustrations","frontmatter":{"title":"Illustrations","type":"Posts","columns":2},"lastUpdated":1595105761233.0308},"/sketches/":{"title":"Digital Sketching","frontmatter":{"title":"Digital Sketching","type":"Post","relevant":["/illustrations/christmass-toy","/illustrations/dubrovsky"]},"lastUpdated":1595105761249.0308},"/work/":{"title":"Series & projects","frontmatter":{"title":"Series & projects","type":"Posts","columns":2},"lastUpdated":1595105761249.0308},"/illustrations/christmas-toy/":{"title":"Christmas toy","frontmatter":{"publishDate":"26 dec 2019","title":"Christmas toy","type":"Post","preview":"/assets/christmas-toy/img-1.png","relevant":["/illustrations/christmas-toy/","/illustrations/dubrovsky/"]},"lastUpdated":1595105761233.0308},"/illustrations/dubrovsky/":{"title":"Dubrovsky","frontmatter":{"publishDate":"26 jan 2020","title":"Dubrovsky","type":"Post","preview":"/assets/dubrovsky/img-1.png","relevant":["/illustrations/christmas-toy/","/illustrations/dubrovsky/"]},"lastUpdated":1595105761233.0308},"/illustrations/egg/":{"title":"Egg","frontmatter":{"publishDate":"10 apr 2020","title":"Egg","type":"Post","preview":"/assets/egg/preview.png","relevant":["/illustrations/christmas-toy/","/illustrations/dubrovsky/"]},"lastUpdated":1595105761233.0308}}';
const parse$1 = (data2) => readonly(JSON.parse(data2));
const pagesDataRef = ref(parse$1(serialized$1));
function usePagesData() {
  return pagesDataRef;
}
const data = usePagesData();
const getPagesStartingWith = (pageUrl) => {
  const pages = data.value;
  const result = [];
  for (const [url, content] of Object.entries(pages)) {
    if (url.startsWith(pageUrl) && url !== pageUrl) {
      result.push(__assign2({url}, content));
    }
  }
  return result;
};
const sortByDate = (items) => {
  items.sort((a, b) => {
    const isEmptyDate = !(a && a.frontmatter && a.frontmatter.publishDate) || !(b && b.frontmatter && b.frontmatter.publishDate);
    if (isEmptyDate) {
      return 0;
    }
    return new Date(a.frontmatter.publishDate).getTime() > new Date(b.frontmatter.publishDate).getTime() ? -1 : 1;
  });
};
const useChildPages = (mapper = (el) => el) => {
  const router = useRouter();
  return computed(() => {
    const routePath = router.route.path.replace("index.html", "");
    const result = getPagesStartingWith(routePath);
    sortByDate(result);
    return mapper(result);
  });
};
const usePages = (mapper = (el) => el) => {
  return computed(() => {
    const result = getPagesStartingWith("/");
    sortByDate(result);
    return mapper(result);
  });
};
const getPageDataByUrl = (url) => data.value[url];
var script$c = {
  components: {ItemsGrid: script$b},
  props: {items: {default: () => []}, columns: {default: 2}},
  setup(props) {
    const pages = computed(() => (props.items || []).map((url) => {
      var _a;
      return (_a = getPageDataByUrl(url)) == null ? void 0 : _a.frontmatter;
    }));
    const year = (pageData) => pageData && pageData.publishDate ? new Date(pageData.publishDate).getFullYear() : "";
    return {
      pages,
      year
    };
  }
};
const _withId$6 = /* @__PURE__ */ withScopeId("data-v-90354910");
pushScopeId("data-v-90354910");
const _hoisted_1$9 = {class: "post-content"};
const _hoisted_2$8 = {
  key: 0,
  class: "title"
};
popScopeId();
const render$c = /* @__PURE__ */ _withId$6(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_ItemsGrid = resolveComponent("ItemsGrid");
  return openBlock(), createBlock(_component_ItemsGrid, {
    items: _ctx.items,
    columns: _ctx.columns
  }, {
    bg: _withId$6(({index: index2}) => [
      _ctx.pages[index2] ? (openBlock(), createBlock("img", {
        key: 0,
        class: "post-image",
        src: _ctx.pages[index2].preview
      }, null, 8, ["src"])) : createCommentVNode("v-if", true)
    ]),
    content: _withId$6(({index: index2}) => [
      createVNode("div", _hoisted_1$9, [
        createVNode("div", null, toDisplayString(_ctx.year(_ctx.pages[index2])), 1),
        _ctx.pages[index2] ? (openBlock(), createBlock("div", _hoisted_2$8, toDisplayString(_ctx.pages[index2].title), 1)) : createCommentVNode("v-if", true)
      ])
    ]),
    _: 1
  }, 8, ["items", "columns"]);
});
;
script$c.render = render$c;
script$c.__scopeId = "data-v-90354910";
var script$d = {
  props: {name: String}
};
const _withId$7 = /* @__PURE__ */ withScopeId("data-v-f6828c58");
pushScopeId("data-v-f6828c58");
const _hoisted_1$a = {class: "material-icons icon"};
popScopeId();
const render$d = /* @__PURE__ */ _withId$7(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createBlock("i", _hoisted_1$a, toDisplayString(_ctx.name), 1);
});
;
script$d.render = render$d;
script$d.__scopeId = "data-v-f6828c58";
var script$e = {
  components: {ButtonBase: script$1}
};
function render$e(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_ButtonBase = resolveComponent("ButtonBase");
  return openBlock(), createBlock(_component_ButtonBase, null, {
    default: withCtx(() => [
      renderSlot(_ctx.$slots, "default")
    ]),
    _: 3
  });
}
script$e.render = render$e;
var script$f = {
  components: {Icon: script$d, Button: script$e},
  setup() {
    const site = useSiteData();
    return {
      showMenu: ref(false),
      nav: computed(() => site.value.themeConfig.nav)
    };
  }
};
var _imports_0 = "/assets/sidebar-ava.png";
const _withId$8 = /* @__PURE__ */ withScopeId("data-v-e40a0d36");
pushScopeId("data-v-e40a0d36");
const _hoisted_1$b = {class: "sidebar"};
const _hoisted_2$9 = /* @__PURE__ */ createVNode("a", {
  class: "ava",
  href: "/"
}, [
  /* @__PURE__ */ createVNode("img", {src: _imports_0})
], -1);
const _hoisted_3$6 = {class: "nav"};
popScopeId();
const render$f = /* @__PURE__ */ _withId$8(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_Icon = resolveComponent("Icon");
  const _component_Button = resolveComponent("Button");
  return openBlock(), createBlock("div", _hoisted_1$b, [
    _hoisted_2$9,
    createVNode(_component_Button, {
      class: "open-menu round ghost icon",
      onClick: _cache[1] || (_cache[1] = ($event) => _ctx.showMenu = true)
    }, {
      default: _withId$8(() => [
        createVNode(_component_Icon, {name: "menu"})
      ]),
      _: 1
    }),
    createVNode("div", {
      class: ["overlay", {open: _ctx.showMenu}]
    }, [
      createVNode("nav", _hoisted_3$6, [
        createVNode(_component_Button, {
          class: "close-menu round ghost icon",
          onClick: _cache[2] || (_cache[2] = ($event) => _ctx.showMenu = false)
        }, {
          default: _withId$8(() => [
            createVNode(_component_Icon, {name: "close"})
          ]),
          _: 1
        }),
        (openBlock(true), createBlock(Fragment, null, renderList(_ctx.nav, ({text, link: link2}) => {
          return openBlock(), createBlock("a", {
            key: text,
            class: "nav-link",
            href: link2,
            onClick: _cache[3] || (_cache[3] = ($event) => _ctx.showMenu = false)
          }, toDisplayString(text), 9, ["href"]);
        }), 128))
      ])
    ], 2)
  ]);
});
;
script$f.render = render$f;
script$f.__scopeId = "data-v-e40a0d36";
var script$g = {
  components: {Socials: script$9},
  setup() {
    return {
      year: new Date().getFullYear()
    };
  }
};
const _withId$9 = /* @__PURE__ */ withScopeId("data-v-4ad6affe");
pushScopeId("data-v-4ad6affe");
const _hoisted_1$c = {class: "footer"};
const _hoisted_2$a = {class: "copyright"};
popScopeId();
const render$g = /* @__PURE__ */ _withId$9(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_Socials = resolveComponent("Socials");
  return openBlock(), createBlock("footer", _hoisted_1$c, [
    createVNode(_component_Socials),
    createVNode("div", _hoisted_2$a, "Copyright © " + toDisplayString(_ctx.year), 1)
  ]);
});
;
script$g.render = render$g;
script$g.__scopeId = "data-v-4ad6affe";
var script$h = {};
const _withId$a = /* @__PURE__ */ withScopeId("data-v-96fbf99c");
pushScopeId("data-v-96fbf99c");
const _hoisted_1$d = {class: "ghost-button"};
popScopeId();
const render$h = /* @__PURE__ */ _withId$a(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createBlock("button", _hoisted_1$d, [
    renderSlot(_ctx.$slots, "default")
  ]);
});
;
script$h.render = render$h;
script$h.__scopeId = "data-v-96fbf99c";
var script$i = {
  components: {GhostButton: script$h, Icon: script$d},
  setup() {
    const app = inject("app");
    const scrollToTop = () => {
      app.scrollToTop();
    };
    return {scrollToTop};
  }
};
const _withId$b = /* @__PURE__ */ withScopeId("data-v-fbe9da70");
const render$i = /* @__PURE__ */ _withId$b(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_Icon = resolveComponent("Icon");
  const _component_GhostButton = resolveComponent("GhostButton");
  return openBlock(), createBlock(_component_GhostButton, {
    class: "back-to-top",
    onClick: _ctx.scrollToTop
  }, {
    default: _withId$b(() => [
      createVNode(_component_Icon, {name: "arrow_upward"})
    ]),
    _: 1
  }, 8, ["onClick"]);
});
;
script$i.render = render$i;
script$i.__scopeId = "data-v-fbe9da70";
var script$j = {
  components: {Sidebar: script$f, PostsGrid: script$c, Footer: script$g, BackToTop: script$i},
  props: {page: Object},
  setup() {
    const page = usePageData();
    return {
      items: useChildPages((pages) => pages.map(({url}) => url)),
      columns: computed(() => page.value.frontmatter.columns)
    };
  }
};
const _withId$c = /* @__PURE__ */ withScopeId("data-v-30e192f0");
pushScopeId("data-v-30e192f0");
const _hoisted_1$e = {class: "page-content"};
popScopeId();
const render$j = /* @__PURE__ */ _withId$c(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_Sidebar = resolveComponent("Sidebar");
  const _component_PostsGrid = resolveComponent("PostsGrid");
  const _component_Content = resolveComponent("Content");
  const _component_Footer = resolveComponent("Footer");
  const _component_BackToTop = resolveComponent("BackToTop");
  return openBlock(), createBlock(Fragment, null, [
    createVNode(_component_Sidebar),
    createVNode("div", _hoisted_1$e, [
      createVNode(_component_PostsGrid, {
        items: _ctx.items,
        columns: _ctx.columns
      }, null, 8, ["items", "columns"]),
      createVNode(_component_Content),
      createVNode(_component_Footer)
    ]),
    createVNode(_component_BackToTop)
  ], 64);
});
;
script$j.render = render$j;
script$j.__scopeId = "data-v-30e192f0";
let index = 0;
const getNextId = () => `text-field-${++index}`;
var script$k = {
  inheritAttrs: false,
  props: {
    value: {default: ""},
    id: {default: getNextId},
    label: {default: ""},
    required: {type: Boolean, default: false},
    multiline: {type: Boolean, default: false}
  }
};
const _withId$d = /* @__PURE__ */ withScopeId("data-v-cd4c8b36");
const render$k = /* @__PURE__ */ _withId$d(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createBlock(Fragment, null, [
    createVNode("label", {
      class: ["field-label", _ctx.required && "required"],
      for: _ctx.id
    }, [
      renderSlot(_ctx.$slots, "label", {}, () => [
        createTextVNode(toDisplayString(_ctx.label), 1)
      ])
    ], 10, ["for"]),
    (openBlock(), createBlock(resolveDynamicComponent(_ctx.multiline ? "textarea" : "input"), mergeProps({class: "field-input"}, __assign2(__assign2(__assign2({}, _ctx.$props), _ctx.$attrs), {label: void 0, multiline: void 0}), {
      onInput: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("update:value", $event.target.value))
    }), null, 16))
  ], 64);
});
;
script$k.render = render$k;
script$k.__scopeId = "data-v-cd4c8b36";
const getJsonData = (form) => {
  const formData = new FormData(form);
  const result = {};
  for (const [key, value] of formData.entries()) {
    result[key] = value;
  }
  return JSON.stringify(result);
};
var script$l = {
  components: {Sidebar: script$f, TextField: script$k, Button: script$e, Icon: script$d, Footer: script$g},
  setup() {
    const site = useSiteData();
    const action = site.value.themeConfig.form.action;
    const form = ref();
    const submitted = ref(false);
    const completed = ref(false);
    const err = ref();
    const manualSubmit = async () => {
      try {
        const promise = fetch(action, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json"
          },
          body: getJsonData(form.value)
        });
        submitted.value = true;
        const response = await promise;
        const result = await response.json();
        completed.value = !!result.ok;
        if (!result.ok) {
          throw new Error("Submission failed");
        }
      } catch (error) {
        submitted.value = true;
        err.value = error;
        await nextTick();
        form.value.submit();
      }
    };
    return {
      action,
      form,
      submitted,
      completed,
      err,
      onsubmit(event) {
        const supportsFetch = "fetch" in window;
        if (!supportsFetch || err.value) {
          return;
        }
        event.preventDefault();
        manualSubmit();
      }
    };
  }
};
const _withId$e = /* @__PURE__ */ withScopeId("data-v-d62ccb56");
pushScopeId("data-v-d62ccb56");
const _hoisted_1$f = {class: "contact"};
const _hoisted_2$b = {class: "form-title"};
const _hoisted_3$7 = {class: "text-block"};
const _hoisted_4$1 = {class: "field"};
const _hoisted_5 = {class: "field"};
const _hoisted_6 = {class: "field"};
const _hoisted_7 = /* @__PURE__ */ createTextVNode("Submit");
const _hoisted_8 = {
  key: 0,
  class: "overlay"
};
const _hoisted_9 = /* @__PURE__ */ createTextVNode(" Submitting... ");
const _hoisted_10 = /* @__PURE__ */ createTextVNode(" Complete! ");
popScopeId();
const render$l = /* @__PURE__ */ _withId$e(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_Sidebar = resolveComponent("Sidebar");
  const _component_Content = resolveComponent("Content");
  const _component_TextField = resolveComponent("TextField");
  const _component_Button = resolveComponent("Button");
  const _component_Icon = resolveComponent("Icon");
  const _component_Footer = resolveComponent("Footer");
  return openBlock(), createBlock(Fragment, null, [
    createVNode(_component_Sidebar),
    createVNode("div", _hoisted_1$f, [
      createVNode("h1", _hoisted_2$b, toDisplayString(_ctx.$page.title), 1),
      createVNode("div", _hoisted_3$7, [
        createVNode(_component_Content)
      ]),
      createVNode("form", {
        ref: "form",
        action: _ctx.action,
        method: "POST",
        class: "form",
        onSubmit: _cache[1] || (_cache[1] = (...args) => _ctx.onsubmit(...args))
      }, [
        createVNode("fieldset", _hoisted_4$1, [
          createVNode(_component_TextField, {
            name: "name",
            type: "text",
            label: "Your name",
            required: "",
            placeholder: "Name..."
          })
        ]),
        createVNode("fieldset", _hoisted_5, [
          createVNode(_component_TextField, {
            name: "email",
            type: "email",
            label: "Your email",
            required: "",
            placeholder: "example@domain.com"
          })
        ]),
        createVNode("fieldset", _hoisted_6, [
          createVNode(_component_TextField, {
            name: "message",
            multiline: "",
            label: "Message",
            rows: "5",
            placeholder: "Your message"
          })
        ]),
        createVNode(_component_Button, {
          class: "primary",
          type: "submit"
        }, {
          default: _withId$e(() => [
            _hoisted_7
          ]),
          _: 1
        }),
        _ctx.submitted ? (openBlock(), createBlock("div", _hoisted_8, [
          createVNode(_component_Icon, {
            class: "success",
            name: "check_circle"
          }),
          !_ctx.completed ? (openBlock(), createBlock(Fragment, {key: 0}, [
            _hoisted_9
          ], 64)) : (openBlock(), createBlock(Fragment, {key: 1}, [
            _hoisted_10
          ], 64))
        ])) : createCommentVNode("v-if", true),
        _ctx.err ? (openBlock(), createBlock("input", {
          key: 1,
          type: "hidden",
          name: "error",
          value: _ctx.err.stack || _ctx.err
        }, null, 8, ["value"])) : createCommentVNode("v-if", true)
      ], 40, ["action"]),
      createVNode(_component_Footer)
    ])
  ], 64);
});
;
script$l.render = render$l;
script$l.__scopeId = "data-v-d62ccb56";
var script$m = {
  components: {GhostButton: script$h, Icon: script$d, Button: script$e},
  inheritAttrs: false,
  setup() {
    let list = [];
    const root = ref(null);
    const overlay = ref(null);
    const state = reactive({
      opened: false,
      active: null,
      zoomed: false,
      count: 0
    });
    const updateList = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const images = root.value.querySelectorAll("img");
      list = [...images];
      state.count = images.length;
    };
    onMounted(updateList);
    const getCurrentIndex = () => list.findIndex((el) => el.src === state.active);
    const goNext = () => {
      const index2 = getCurrentIndex();
      state.active = list[(index2 + 1) % list.length].src;
    };
    const goBack = () => {
      const index2 = getCurrentIndex();
      state.active = list[index2 > 0 ? index2 - 1 : list.length - 1].src;
    };
    const handleImgClick = (event) => {
      if (event.target.tagName !== "IMG") {
        return;
      }
      state.active = event.target.src;
      openOverlay();
    };
    const openOverlay = () => {
      state.opened = true;
      nextTick(() => {
        overlay.value.focus();
      });
    };
    const closeOverlay = () => {
      state.opened = false;
      state.zoomed = false;
      state.active = null;
    };
    return __assign2({
      root,
      overlay,
      goNext,
      goBack,
      handleImgClick,
      closeOverlay
    }, toRefs(state));
  }
};
const _withId$f = /* @__PURE__ */ withScopeId("data-v-2341cbd8");
pushScopeId("data-v-2341cbd8");
const _hoisted_1$g = {class: "controls"};
popScopeId();
const render$m = /* @__PURE__ */ _withId$f(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_Icon = resolveComponent("Icon");
  const _component_Button = resolveComponent("Button");
  const _component_GhostButton = resolveComponent("GhostButton");
  return openBlock(), createBlock(Fragment, null, [
    createVNode("div", {
      ref: "root",
      class: "gallery",
      onClick: _cache[1] || (_cache[1] = (...args) => _ctx.handleImgClick(...args))
    }, [
      renderSlot(_ctx.$slots, "default")
    ], 512),
    createVNode("div", {
      ref: "overlay",
      class: ["gallery-overlay", _ctx.opened && "opened"],
      tabindex: "0",
      onKeydown: _cache[5] || (_cache[5] = withKeys((...args) => _ctx.closeOverlay(...args), ["esc"]))
    }, [
      createVNode("div", _hoisted_1$g, [
        createVNode(_component_Button, {
          class: "close-overlay round ghost icon",
          onClick: _ctx.closeOverlay
        }, {
          default: _withId$f(() => [
            createVNode(_component_Icon, {name: "close"})
          ]),
          _: 1
        }, 8, ["onClick"]),
        _ctx.count > 1 ? (openBlock(), createBlock("div", {
          key: 0,
          class: "left-area",
          onClick: _cache[2] || (_cache[2] = (...args) => _ctx.goBack(...args))
        }, [
          createVNode(_component_GhostButton, {class: "control-button"}, {
            default: _withId$f(() => [
              createVNode(_component_Icon, {name: "arrow_backward"})
            ]),
            _: 1
          })
        ])) : createCommentVNode("v-if", true),
        _ctx.count > 1 ? (openBlock(), createBlock("div", {
          key: 1,
          class: "right-area",
          onClick: _cache[3] || (_cache[3] = (...args) => _ctx.goNext(...args))
        }, [
          createVNode(_component_GhostButton, {class: "control-button"}, {
            default: _withId$f(() => [
              createVNode(_component_Icon, {name: "arrow_forward"})
            ]),
            _: 1
          })
        ])) : createCommentVNode("v-if", true)
      ]),
      createVNode("div", {
        class: ["image-container", _ctx.zoomed && "zoomed"]
      }, [
        createVNode("img", {
          class: "image",
          src: _ctx.active,
          onClick: _cache[4] || (_cache[4] = ($event) => _ctx.zoomed = !_ctx.zoomed)
        }, null, 8, ["src"])
      ], 2)
    ], 34)
  ], 64);
});
;
script$m.render = render$m;
script$m.__scopeId = "data-v-2341cbd8";
var script$n = {
  components: {Gallery: script$m}
};
function render$n(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_Content = resolveComponent("Content");
  const _component_Gallery = resolveComponent("Gallery");
  return openBlock(), createBlock(_component_Gallery, null, {
    default: withCtx(() => [
      createVNode(_component_Content, {class: "md-content"})
    ]),
    _: 1
  });
}
;
script$n.render = render$n;
var script$o = {
  components: {PostsGrid: script$c},
  props: {items: {default: () => []}}
};
const _withId$g = /* @__PURE__ */ withScopeId("data-v-8ed38a96");
pushScopeId("data-v-8ed38a96");
const _hoisted_1$h = {
  key: 0,
  class: "relevant"
};
const _hoisted_2$c = /* @__PURE__ */ createVNode("h2", {class: "title"}, "You may also like", -1);
popScopeId();
const render$o = /* @__PURE__ */ _withId$g(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_PostsGrid = resolveComponent("PostsGrid");
  return _ctx.items.length ? (openBlock(), createBlock("div", _hoisted_1$h, [
    _hoisted_2$c,
    createVNode(_component_PostsGrid, {items: _ctx.items}, null, 8, ["items"])
  ])) : createCommentVNode("v-if", true);
});
;
script$o.render = render$o;
script$o.__scopeId = "data-v-8ed38a96";
var script$p = {
  components: {Sidebar: script$f, Footer: script$g, MdContent: script$n, Relevant: script$o, BackToTop: script$i},
  props: {page: Object},
  setup() {
    const page = usePageData();
    return {
      items: new Array(10).fill("/illustrations/egg/"),
      title: computed(() => page.value.frontmatter.ti)
    };
  }
};
const _withId$h = /* @__PURE__ */ withScopeId("data-v-b098d246");
pushScopeId("data-v-b098d246");
const _hoisted_1$i = {class: "page-content"};
const _hoisted_2$d = {class: "title"};
popScopeId();
const render$p = /* @__PURE__ */ _withId$h(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_Sidebar = resolveComponent("Sidebar");
  const _component_MdContent = resolveComponent("MdContent");
  const _component_Relevant = resolveComponent("Relevant");
  const _component_Footer = resolveComponent("Footer");
  const _component_BackToTop = resolveComponent("BackToTop");
  return openBlock(), createBlock(Fragment, null, [
    createVNode(_component_Sidebar),
    createVNode("div", _hoisted_1$i, [
      createVNode("h1", _hoisted_2$d, toDisplayString(_ctx.$page.title), 1),
      createVNode(_component_MdContent),
      createVNode(_component_Relevant, {
        items: _ctx.$page.frontmatter.relevant
      }, null, 8, ["items"]),
      createVNode(_component_Footer)
    ]),
    createVNode(_component_BackToTop)
  ], 64);
});
;
script$p.render = render$p;
script$p.__scopeId = "data-v-b098d246";
var script$q = {
  components: {PostsGrid: script$c, Sidebar: script$f, Footer: script$g},
  inheritAttrs: false,
  setup() {
    const items = usePages((pages) => {
      const list = pages.filter((page) => page.frontmatter.preview).map(({url}) => url);
      const seed = Math.ceil(Math.random() * list.length - 1);
      return [list[seed]];
    });
    return {
      items
    };
  }
};
const _withId$i = /* @__PURE__ */ withScopeId("data-v-d9f05d6c");
pushScopeId("data-v-d9f05d6c");
const _hoisted_1$j = {class: "not-found"};
const _hoisted_2$e = /* @__PURE__ */ createVNode("div", {class: "code"}, "404", -1);
const _hoisted_3$8 = /* @__PURE__ */ createVNode("h1", {class: "title"}, "The page does not exist", -1);
const _hoisted_4$2 = /* @__PURE__ */ createVNode("div", {class: "message"}, "Here is something for you", -1);
popScopeId();
const render$q = /* @__PURE__ */ _withId$i(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_Sidebar = resolveComponent("Sidebar");
  const _component_PostsGrid = resolveComponent("PostsGrid");
  const _component_Footer = resolveComponent("Footer");
  return openBlock(), createBlock(Fragment, null, [
    createVNode(_component_Sidebar),
    createVNode("div", _hoisted_1$j, [
      _hoisted_2$e,
      _hoisted_3$8,
      _hoisted_4$2,
      createVNode(_component_PostsGrid, {
        items: _ctx.items,
        columns: "1"
      }, null, 8, ["items"]),
      createVNode(_component_Footer)
    ])
  ], 64);
});
;
script$q.render = render$q;
script$q.__scopeId = "data-v-d9f05d6c";
var script$r = {
  components: {Home: script$a, Posts: script$j, Post: script$p, Contact: script$l, NotFound: script$q},
  setup() {
    const providedApp = {
      root: ref(null),
      scrollToTop(smooth = true) {
        this.root.value && this.root.value.scrollTo({
          top: 0,
          behavior: smooth ? "smooth" : void 0
        });
      }
    };
    onMounted(() => {
      const app = document.getElementById("app");
      providedApp.root.value = app;
      app.addEventListener("click", (event) => {
        if (event.path.find((el) => el.tagName === "A" && el.getAttribute("href").startsWith("/"))) {
          providedApp.scrollToTop(false);
        }
      });
    });
    provide("app", providedApp);
  }
};
const _withId$j = /* @__PURE__ */ withScopeId("data-v-77327dae");
pushScopeId("data-v-77327dae");
const _hoisted_1$k = {class: "theme-root"};
popScopeId();
const render$r = /* @__PURE__ */ _withId$j(function render2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_Content = resolveComponent("Content");
  return openBlock(), createBlock("div", _hoisted_1$k, [
    _ctx.$page.frontmatter && _ctx.$page.frontmatter.type ? (openBlock(), createBlock(resolveDynamicComponent(_ctx.$page.frontmatter.type), {key: 0})) : createVNode(_component_Content, {key: 1}),
    renderSlot(_ctx.$slots, "default")
  ]);
});
;
script$r.render = render$r;
script$r.__scopeId = "data-v-77327dae";
;
var thene = {
  Layout: script$r,
  NotFound: script$q
};
const NotFound = thene.NotFound || (() => "404 Not Found");
function createApp() {
  const pageDataRef = ref();
  if (inBrowser) {
    useUpdateHead(pageDataRef);
  }
  let isInitialPageLoad = inBrowser;
  let initialPath;
  const router = createRouter((route) => {
    let pagePath = pathToFile(route.path);
    if (isInitialPageLoad) {
      initialPath = pagePath;
    }
    if (isInitialPageLoad || initialPath === pagePath) {
      pagePath = pagePath.replace(/\.js$/, ".lean.js");
    }
    if (inBrowser) {
      isInitialPageLoad = false;
      return import(pagePath).then((page) => {
        if (page.__pageData) {
          pageDataRef.value = readonly(JSON.parse(page.__pageData));
        }
        return page.default;
      });
    } else {
      const page = require(pagePath);
      pageDataRef.value = JSON.parse(page.__pageData);
      return page.default;
    }
  }, NotFound);
  const app = createSSRApp(thene.Layout);
  app.provide(RouterSymbol, router);
  app.provide(pageDataSymbol, pageDataRef);
  app.component("Content", Content);
  app.component("Debug", () => null);
  Object.defineProperties(app.config.globalProperties, {
    $site: {
      get() {
        return siteDataRef.value;
      }
    },
    $page: {
      get() {
        return pageDataRef.value;
      }
    },
    $theme: {
      get() {
        return siteDataRef.value.themeConfig;
      }
    }
  });
  if (thene.enhanceApp) {
    thene.enhanceApp({
      app,
      router,
      siteData: siteDataRef
    });
  }
  return {app, router};
}
if (inBrowser) {
  const {app, router} = createApp();
  router.go().then(() => {
    app.mount("#app");
  });
}
export {createApp};
