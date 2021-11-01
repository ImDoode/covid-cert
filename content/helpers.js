(function () {
  "use strict";
  window.APP_HELPERS = {
    getCovidAppConfig: function () {
      return new Promise((resolve, reject) => {
        const result = {
          "production": true,
          "baseUrl": "https://www.gosuslugi.ru/",
          "betaUrl": "https://www.gosuslugi.ru/",
          "lkUrl": "https://lk.gosuslugi.ru/",
          "lkApiUrl": "//www.gosuslugi.ru/api/lk/v1/",
          "yaCounter": 66958591,
          "authProviderUrl": "//www.gosuslugi.ru/auth-provider/login?rUrl=",
          "nsiApiUrl": "//www.gosuslugi.ru/api/nsi/v1/",
          "staticDomainLibAssetsPath": "//gu-st.ru/covid-web-st/lib-assets/",
          "timingApiUrl": "//www.gosuslugi.ru/health",
          "staticDomainAssetsPath": "//gu-st.ru/covid-web-st/assets/",
          "appStores": {
              "appStore": "https://redirect.appmetrica.yandex.com/serve/529060629282032912",
              "googlePlay": "https://redirect.appmetrica.yandex.com/serve/745233407570662167",
              "appGallery": "https://appgallery8.huawei.com/#/app/C101280309"
          },
          "socialNetworks": {
              "vk": "https://vk.me/new.gosuslugi",
              "ok": "https://ok.ru/gosuslugi",
              "fb": "https://www.facebook.com/new.gosuslugi",
              "tg": "https://t.me/gosuslugi"
          },
          "portalCfgUrl": "//www.gosuslugi.ru/api/portal-cfg/",
          "mainBlocksData": "//www.gosuslugi.ru/api/mainpage/v4",
          "covidCertCheckUrl": "//www.gosuslugi.ru/api/covid-cert/v3/cert/check/",
          "covidCertUrl": "//www.gosuslugi.ru/api/covid-cert/v2/",
          "registerCovidUrl": "//www.gosuslugi.ru/api/register-covid/v2/",
          "vaccineUrl": "//www.gosuslugi.ru/api/vaccine/v1/",
          "covidCertPdfUrl": "//www.gosuslugi.ru/api/covid-cert/v1/cert/{unrzFull}/pgu/srfile/pdf",
          "vaccineUrlv2": "//www.gosuslugi.ru/api/vaccine/v2/"
      };
      resolve(result);
    });
    }
  }
})();
