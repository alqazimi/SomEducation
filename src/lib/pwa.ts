export const PWA_BANNER_DISMISS_KEY = "someducation-pwa-banner-dismissed";
export const PWA_INSTALL_AVAILABLE_EVENT = "pwa-install-available";
export const PWA_INSTALLED_EVENT = "pwa-installed";
export const PWA_INSTALL_NEEDS_RETRY_EVENT = "pwa-install-needs-retry";

export function isSecurePwaContext(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  const isLocalhost = host === "localhost" || host === "127.0.0.1";
  return window.location.protocol === "https:" || isLocalhost;
}

/** Capture install prompt, register SW, and expose one-tap install before React loads. */
export const PWA_EARLY_INSTALL_CAPTURE = `
(function(){
  if(typeof window==="undefined")return;
  if(window.__pwaBootstrap)return;
  window.__pwaBootstrap=true;

  var INSTALL_AVAILABLE="${PWA_INSTALL_AVAILABLE_EVENT}";
  var INSTALLED="${PWA_INSTALLED_EVENT}";
  var NEEDS_RETRY="${PWA_INSTALL_NEEDS_RETRY_EVENT}";
  var RELOAD_KEY="someducation-pwa-sw-reload";

  function isLocalhost(){
    var h=location.hostname;
    return h==="localhost"||h==="127.0.0.1";
  }
  function canRegisterSW(){
    return "serviceWorker"in navigator&&(location.protocol==="https:"||isLocalhost());
  }
  function isIOS(){
    var ua=navigator.userAgent;
    return /iPad|iPhone|iPod/.test(ua)||(ua.indexOf("Mac")>=0&&"ontouchend"in document);
  }
  function isAndroid(){
    return /Android/i.test(navigator.userAgent);
  }

  window.__pwaDeferredInstall=null;

  function storeInstall(e){
    e.preventDefault();
    window.__pwaDeferredInstall=e;
    window.dispatchEvent(new Event(INSTALL_AVAILABLE));
  }

  window.addEventListener("beforeinstallprompt",storeInstall);
  window.addEventListener("appinstalled",function(){
    window.__pwaDeferredInstall=null;
    try{sessionStorage.removeItem(RELOAD_KEY)}catch(x){}
    window.dispatchEvent(new Event(INSTALLED));
  });

  if(canRegisterSW()){
    navigator.serviceWorker.register("/sw.js",{scope:"/",updateViaCache:"none"}).catch(function(){});
    navigator.serviceWorker.addEventListener("controllerchange",function(){
      window.dispatchEvent(new Event(INSTALL_AVAILABLE));
    });
  }

  window.__pwaInstallNow=function(){
    var prompt=window.__pwaDeferredInstall;
    if(prompt&&typeof prompt.prompt==="function"){
      try{
        var p=prompt.prompt();
        if(p&&typeof p.then==="function"){
          p.then(function(){
            if(prompt.userChoice){
              prompt.userChoice.then(function(choice){
                if(choice&&choice.outcome==="accepted"){
                  window.__pwaDeferredInstall=null;
                  window.dispatchEvent(new Event(INSTALLED));
                }
              });
            }
          }).catch(function(){});
        }
        return true;
      }catch(err){
        console.warn("[SomEducation] PWA install failed:",err);
      }
    }

    if(isIOS()&&navigator.share){
      try{
        navigator.share({title:"SomEducation",url:location.origin+"/"});
        return true;
      }catch(err){
        if(err&&err.name==="AbortError")return true;
      }
    }

    if(isAndroid()&&"serviceWorker"in navigator){
      navigator.serviceWorker.getRegistration().then(function(reg){
        if(reg&&!navigator.serviceWorker.controller){
          try{
            if(!sessionStorage.getItem(RELOAD_KEY)){
              sessionStorage.setItem(RELOAD_KEY,"1");
              location.reload();
              return;
            }
          }catch(x){}
        }
        window.dispatchEvent(new Event(NEEDS_RETRY));
      }).catch(function(){
        window.dispatchEvent(new Event(NEEDS_RETRY));
      });
      return true;
    }

    window.dispatchEvent(new Event(NEEDS_RETRY));
    return false;
  };
})();
`;

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    nav.standalone === true
  );
}

export function isIosInstallable(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes("Mac") && "ontouchend" in document)
  );
}

export function isIosSafari(): boolean {
  if (typeof window === "undefined" || !isIosInstallable()) return false;
  const ua = window.navigator.userAgent;
  return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
}

export function isAndroid(): boolean {
  if (typeof window === "undefined") return false;
  return /Android/i.test(window.navigator.userAgent);
}

export function isMobileInstallable(): boolean {
  return isIosInstallable() || isAndroid();
}

export function canUseWebShare(): boolean {
  if (typeof window === "undefined") return false;
  return typeof navigator.share === "function";
}

export function getPwaShareUrl(): string {
  if (typeof window === "undefined") return "/";
  return window.location.origin + "/";
}

export function triggerPwaInstallFromClick(): boolean {
  if (typeof window === "undefined") return false;
  const installNow = (
    window as Window & { __pwaInstallNow?: () => boolean }
  ).__pwaInstallNow;
  if (typeof installNow === "function") {
    return installNow();
  }
  return false;
}

/** Banner hidden for current browser tab/session only — resets on next visit. */
export function isInstallBannerDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(PWA_BANNER_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissInstallBanner(): void {
  try {
    sessionStorage.setItem(PWA_BANNER_DISMISS_KEY, "1");
  } catch {
    // ignore storage errors
  }
}

export function registerServiceWorker(): void {
  if (!isSecurePwaContext() || !("serviceWorker" in navigator)) return;

  void navigator.serviceWorker
    .register("/sw.js", { scope: "/", updateViaCache: "none" })
    .catch((error) => {
      console.warn("[SomEducation] Service worker registration failed:", error);
    });
}
