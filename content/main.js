(function () {
  window.APP = {
    lang: 'ru',
    toogleLang: function () {
      this.lang = this.lang === 'en' ? 'ru' : 'en';
      var queryParams = new URLSearchParams(window.location.search);
      queryParams.set("lang", this.lang);
      window.history.replaceState(null, null, "?" + queryParams.toString());
      this.init();
    },
    getValue: function (cert, fieldName) {
      if (this.lang === 'ru') {
        if (cert) {
          return cert[fieldName];
        } else {
          return this[fieldName];
        }
      } else {
        if (cert) {
          return cert['en' + fieldName] || cert[fieldName];
        } else {
          return this['en' + fieldName] || this[fieldName];
        }
      }
    },
    setContainerImage: function (cert) {
      var cls = '';
      var self = this;
      switch (cert.type) {
        case 'TEMPORARY_CERT':
          if (cert.status === 'OK') {
            cls = '';
            self.certStatusName = 'Действителен';
            self.encertStatusName = 'Valid';
          } else if (cert.status === 'CANCELED') {
            cls = 'invalid';
            self.certStatusName = 'Аннулирован';
            self.encertStatusName = 'Cancelled';
          } else if (cert.status === 'EXPIRED') {
            cls = 'invalid';
            self.certStatusName = 'Срок истёк ' + cert.expiredAt;
            self.encertStatusName = 'Expired ' + cert.expiredAt;
          } else if (cert.status === "404") {
            cls = 'invalid';
            self.certStatusName = 'Не найден';
            self.encertStatusName = 'Not found';
          } else {
            cls = 'invalid';
            self.certStatusName = 'Не действителен';
            self.encertStatusName = 'Invalid';
          }
          break;
        case 'VACCINE_CERT':
          if (cert.status === '1') {
            cls = '';
            self.certStatusName = 'Действителен';
            self.encertStatusName = 'Valid';
          } else if (cert.status === "404") {
            cls = 'invalid';
            self.certStatusName = 'Не найден';
            self.encertStatusName = 'Not found';
          } else {
            cls = 'invalid';
            self.certStatusName = 'Не действителен';
            self.encertStatusName = 'Invalid';
          }
          break;
        case 'COVID_TEST':
          if (cert.status === "404") {
            cls = 'invalid';
            self.certStatusName = 'Не найден';
            self.encertStatusName = 'Not found';
          } else if (cert.status !== '0' && cert.status !== '3' && cert.expired !== '1') {
            if (cert.status && cert.status.toLocaleLowerCase() !== 'отрицательный') {
              cls = 'invalid';
              self.encertStatusName = 'Positive';
            } else {
              cls = '';
              self.encertStatusName = 'Negative';
            }
            self.certStatusName = cert.status;
          } else if (cert.status === '3' || cert.expired === '1') {
            cls = 'invalid';
            self.certStatusName = 'Срок истёк ' + cert.expiredAt;
            self.encertStatusName = 'Expired ' + cert.expiredAt;
          } else {
            cls = 'invalid';
            self.certStatusName = 'Не действителен';
            self.encertStatusName = 'Invalid';
          }
          break;
        case 'ILLNESS_FACT':
          if (cert.status === '1') {
            cls = '';
            self.certStatusName = 'Переболел';
            self.encertStatusName = 'Recovered';
          } else if (cert.status === '3' && cert.expiredAt) {
            cls = 'invalid';
            self.certStatusName = 'Срок истёк ' + cert.expiredAt;
            self.encertStatusName = 'Expired ' + cert.expiredAt;
          } else if (cert.status === "404") {
            cls = 'invalid';
            self.certStatusName = 'Не найдено';
            self.encertStatusName = 'Not found';
          } else {
            cls = 'invalid';
            self.certStatusName = 'Не действителен';
            self.encertStatusName = 'Invalid';
          }
          break;
        default:
          cls = 'invalid';
          self.certStatusName = 'Не найден';
          self.encertStatusName = 'Not found';
      }

      // всё хорошо и требуется показать qr код
      if (cert.status !== '404' &&
        cert.status !== '3' &&
        cert.status !== 'EXPIRED' &&
        cert.expired !== '1' &&
        self.isShowQRCode) {
        cls = 'hide';

        var imgElement = document.createElement('img');
        var qrContainerElement = document.querySelector('.qr-container');
        qrContainerElement.innerHTML = '';
        imgElement.setAttribute('src', 'data:image/jpeg;charset=utf-8;base64, ' + cert.qr)
        qrContainerElement.appendChild(imgElement);
        qrContainerElement.classList.remove('hide');

        var qrNumberElement = document.querySelector('.qr-number');
        qrNumberElement.classList.remove('hide');

        qrNumberElement.innerHTML = '№ ' + cert.unrzFull.replace(/^(.{4})(.{4})(.{4})(.*)$/, '$1 $2 $3 $4');

        document.querySelector('.button.close').classList.toggle('hide');
        const buttonDownload = document.querySelector('.button.download');

        buttonDownload.classList.remove('hide');
        buttonDownload.innerHTML = self.lang === 'ru' ? 'Версия для печати' : 'Print version';
        buttonDownload.setAttribute('href', cert.pdfUrl);
      }
      return cls;
    },
    filterAttrs: function (cert, targetNames, engVersion) {
      return cert.attrs.filter(function (attr) {
        return targetNames.indexOf(attr.type) !== -1 && (attr.value || engVersion && attr.envalue);
      });
    },
    completeDates: function (attrsDates, cert) {
      var dates = [];
      var hasResultDate = attrsDates.some(item => item.title === 'Дата результата');
      var hasValidUntil = attrsDates.some(item => item.title === 'Действует до');
      var invalidStatus = +(cert.status) === 3 || cert.status === 'CANCELED' || cert.status === 'EXPIRED';
      var isExpired = cert.expired === '1';
      for (var i = 0; i < attrsDates.length; i++) {
        var item = attrsDates[i];
        if (item.title === 'Дата взятия анализа' && hasResultDate ||
          item.title === 'Действует до' && (invalidStatus || isExpired)) {
          continue;
        }
        dates.push(attrsDates[i]);
      }
      if (!hasValidUntil && cert.expiredAt && !invalidStatus) {
        dates.push({
          type: "date",
          title: "Действует до",
          entitle: "Valid until",
          envalue: cert.expiredAt,
          value: cert.expiredAt,
          order: 1
        });
      }
      return dates;
    },
    showDates: function (attrsDates, status) {
      var datesContainer = document.querySelector('.person-data-dates');
      datesContainer.innerHTML = '';
      var self = this;
      if (attrsDates && attrsDates.length) {
        for (var i = 0; i < attrsDates.length; i++) {
          datesContainer.innerHTML += self.datesHtmlSnippet(self.getValue(attrsDates[i], 'title'), self.getValue(attrsDates[i], 'value'));
        }
      } else {
        datesContainer.classList.add('hide');
      }
    },
    datesHtmlSnippet(title, value) {
      return `
                <div class="mb-4 person-data-wrap align-items-center">
                  <div class="person-date mr-12">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.0625 7.1875C12.4077 7.1875 12.6875 6.90768 12.6875 6.5625C12.6875 6.21732 12.4077 5.9375 12.0625 5.9375C11.7173 5.9375 11.4375 6.21732 11.4375 6.5625C11.4375 6.90768 11.7173 7.1875 12.0625 7.1875Z" fill="#66727F"/>
                      <path d="M13.5 1.25H12.6875V0.625C12.6875 0.279813 12.4077 0 12.0625 0C11.7173 0 11.4375 0.279813 11.4375 0.625V1.25H8.59375V0.625C8.59375 0.279813 8.31394 0 7.96875 0C7.62356 0 7.34375 0.279813 7.34375 0.625V1.25H4.53125V0.625C4.53125 0.279813 4.25144 0 3.90625 0C3.56106 0 3.28125 0.279813 3.28125 0.625V1.25H2.5C1.1215 1.25 0 2.3715 0 3.75V13.5C0 14.8785 1.1215 16 2.5 16H7.28125C7.62644 16 7.90625 15.7202 7.90625 15.375C7.90625 15.0298 7.62644 14.75 7.28125 14.75H2.5C1.81075 14.75 1.25 14.1892 1.25 13.5V3.75C1.25 3.06075 1.81075 2.5 2.5 2.5H3.28125V3.125C3.28125 3.47019 3.56106 3.75 3.90625 3.75C4.25144 3.75 4.53125 3.47019 4.53125 3.125V2.5H7.34375V3.125C7.34375 3.47019 7.62356 3.75 7.96875 3.75C8.31394 3.75 8.59375 3.47019 8.59375 3.125V2.5H11.4375V3.125C11.4375 3.47019 11.7173 3.75 12.0625 3.75C12.4077 3.75 12.6875 3.47019 12.6875 3.125V2.5H13.5C14.1892 2.5 14.75 3.06075 14.75 3.75V7.3125C14.75 7.65769 15.0298 7.9375 15.375 7.9375C15.7202 7.9375 16 7.65769 16 7.3125V3.75C16 2.3715 14.8785 1.25 13.5 1.25Z" fill="#66727F"/>
                      <path d="M12.2188 8.4375C10.1337 8.4375 8.4375 10.1337 8.4375 12.2188C8.4375 14.3038 10.1337 16 12.2188 16C14.3038 16 16 14.3038 16 12.2188C16 10.1337 14.3038 8.4375 12.2188 8.4375ZM12.2188 14.75C10.823 14.75 9.6875 13.6145 9.6875 12.2188C9.6875 10.823 10.823 9.6875 12.2188 9.6875C13.6145 9.6875 14.75 10.823 14.75 12.2188C14.75 13.6145 13.6145 14.75 12.2188 14.75Z" fill="#66727F"/>
                      <path d="M13.125 11.5938H12.8438V10.9375C12.8438 10.5923 12.5639 10.3125 12.2188 10.3125C11.8736 10.3125 11.5938 10.5923 11.5938 10.9375V12.2188C11.5938 12.5639 11.8736 12.8438 12.2188 12.8438H13.125C13.4702 12.8438 13.75 12.5639 13.75 12.2188C13.75 11.8736 13.4702 11.5938 13.125 11.5938Z" fill="#66727F"/>
                      <path d="M9.34375 7.1875C9.68893 7.1875 9.96875 6.90768 9.96875 6.5625C9.96875 6.21732 9.68893 5.9375 9.34375 5.9375C8.99857 5.9375 8.71875 6.21732 8.71875 6.5625C8.71875 6.90768 8.99857 7.1875 9.34375 7.1875Z" fill="#66727F"/>
                      <path d="M6.625 9.90625C6.97018 9.90625 7.25 9.62643 7.25 9.28125C7.25 8.93607 6.97018 8.65625 6.625 8.65625C6.27982 8.65625 6 8.93607 6 9.28125C6 9.62643 6.27982 9.90625 6.625 9.90625Z" fill="#66727F"/>
                      <path d="M3.90625 7.1875C4.25143 7.1875 4.53125 6.90768 4.53125 6.5625C4.53125 6.21732 4.25143 5.9375 3.90625 5.9375C3.56107 5.9375 3.28125 6.21732 3.28125 6.5625C3.28125 6.90768 3.56107 7.1875 3.90625 7.1875Z" fill="#66727F"/>
                      <path d="M3.90625 9.90625C4.25143 9.90625 4.53125 9.62643 4.53125 9.28125C4.53125 8.93607 4.25143 8.65625 3.90625 8.65625C3.56107 8.65625 3.28125 8.93607 3.28125 9.28125C3.28125 9.62643 3.56107 9.90625 3.90625 9.90625Z" fill="#66727F"/>
                      <path d="M3.90625 12.625C4.25143 12.625 4.53125 12.3452 4.53125 12C4.53125 11.6548 4.25143 11.375 3.90625 11.375C3.56107 11.375 3.28125 11.6548 3.28125 12C3.28125 12.3452 3.56107 12.625 3.90625 12.625Z" fill="#66727F"/>
                      <path d="M6.625 12.625C6.97018 12.625 7.25 12.3452 7.25 12C7.25 11.6548 6.97018 11.375 6.625 11.375C6.27982 11.375 6 11.6548 6 12C6 12.3452 6.27982 12.625 6.625 12.625Z" fill="#66727F"/>
                      <path d="M6.625 7.1875C6.97018 7.1875 7.25 6.90768 7.25 6.5625C7.25 6.21732 6.97018 5.9375 6.625 5.9375C6.27982 5.9375 6 6.21732 6 6.5625C6 6.90768 6.27982 7.1875 6.625 7.1875Z" fill="#66727F"/>
                    </svg>
                 </div>
                  <div class="small-text gray mr-4">${title}: </div>
                  <div class="small-text gray">${value}</div>
                </div>
            `;
    },
    showAttrs: function (attrs) {
      var attrsContainer = document.querySelector('.person-data-attrs');
      attrsContainer.innerHTML = '';
      var self = this;
      if (attrs && attrs.length) {
        for (i = 0; i < attrs.length; i++) {
          var attrWrapCls = 'mb-4 person-data-wrap attr-wrap';
          var attrTitleCls = 'small-text mb-4 mr-4 attr-title';
          var attrValueCls = 'attrValue';
          if (attrs[i].type === 'enPassport' && self.lang === 'ru') {
            attrWrapCls = `mb-4 person-data-wrap attr-wrap hide`;
          }
          if (attrs[i].type === 'fio') {
            attrTitleCls = 'small-text mb-4 mr-4 attr-title hide';
            attrValueCls = 'attrValue title-h6 bold text-center';
          } else {
            attrValueCls = 'attrValue small-text gray';
          }
          attrsContainer.innerHTML += `<div class="${attrWrapCls}"><div class="${attrTitleCls}">${self.getValue(attrs[i], "title")}: </div><div class="${attrValueCls}">${self.getValue(attrs[i], "value")}</div></div>`;
        }
      } else {
        attrsContainer.classList.add('hide');
      }
    },
    getParam: function (paramName) {
      var queryString = window.location.search;
      var urlParams = new URLSearchParams(queryString);
      return urlParams.get(paramName)
    },
    fadeOutEffect(elem) {
      const fadeEffect = setInterval(() => {
        if (elem && !elem.style.opacity) {
          elem.style.opacity = '1';
        }
        if (elem && parseFloat(elem.style.opacity) > 0) {
          elem.style.opacity = (parseFloat(elem.style.opacity) - 0.5) + '';
        } else if (elem) {
          clearInterval(fadeEffect);
          elem.parentNode.removeChild(elem);
        }
      }, 10);
    },
    init: function () {
      document.body.classList.add('loading');
      var self = this;
      var unrz = window.location.pathname.split("/").filter((segment) => !!segment).pop();
      var url = self.config.covidCertCheckUrl + unrz;
      var lang = this.getParam('lang');
      this.lang = lang || 'ru';
      var ck = this.getParam('ck');
      // признак, что требуется отображать qr код
      this.isShowQRCode = this.getParam('qr') === 'true';
      if (lang || ck) {
        var params = lang ? `lang=${lang}` : '';
        if (params && ck) {
          params += `&ck=${ck}`
        } else if (ck) {
          params += `ck=${ck}`
        }
        url += `?${params}`;
      }
      var isTemp = unrz.startsWith('4');

      function showData(data) {
        var cert = data;
        self.cert = cert;

        document.body.classList.remove('loading');
        self.fadeOutEffect(document.getElementById('start-app-loader'));

        var unrz = document.querySelector('.unrz');
        var num = document.querySelector('.num-symbol');


        if (cert.attrs) {
          var dates = self.completeDates(self.filterAttrs(cert, ['date']), cert);
          self.showDates(dates);
          self.showAttrs(self.filterAttrs(cert, ['passport', 'enPassport', 'birthDate', 'fio'], self.lang === 'en'));
        }

        var statusContainerCls = self.setContainerImage(cert);
        if (statusContainerCls) {
          document.querySelector('.status-container').classList.add(statusContainerCls);
        }

        if (cert.unrzFull) {
          unrz.innerHTML = cert.unrzFull.replace(/^(.{4})(.{4})(.{4})(.*)$/, '$1 $2 $3 $4');
        } else {
          unrz.classList.add('hide');
          num.classList.add('hide');
        }

        self.setAdditionalInfo(cert);

        self.setText(cert);
      }

      if (!self.cert) {
        (new Promise((resolve, reject) => {
          setTimeout(()=> {
            resolve({
              "items": [
                  {
                      "type": "VACCINE_CERT",
                      "unrz": "660000007440069",
                      "unrzFull": "9660000007440069",
                      "attrs": [
                          {
                              "type": "fio",
                              "title": "ФИО",
                              "entitle": "Full name",
                              "envalue": "K******** K***** N*********",
                              "value": "К******** К***** Н*********",
                              "order": 1
                          },
                          {
                              "type": "birthDate",
                              "title": "Дата рождения",
                              "entitle": "Date of birth",
                              "envalue": "18.07.1994",
                              "value": "18.07.1994",
                              "order": 2
                          },
                          {
                              "type": "passport",
                              "title": "Паспорт",
                              "entitle": "National passport",
                              "envalue": "65** ***699",
                              "value": "65** ***699",
                              "order": 3
                          }
                      ],
                      "title": "Сертификат вакцинации от COVID-19",
                      "entitle": "COVID-19 vaccination certificate",
                      "qr": "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",
                      "status": "1",
                      "order": 0,
                      "expiredAt": "04.06.2022",
                      "serviceUnavailable": false
                  }
              ],
              "hasNext": false
            });
          }, Math.random()*3000+500)
          
        })).then(function (data) {
          if (data && data.items && data.items.length) {
            showData(data.items[0]);
          } else {
            showData(self.emptyState(isTemp));
          }
        }, function () {
          document.body.classList.remove('loading');
          showData(self.emptyState(isTemp));
        });
      } else {
        showData(self.cert);
      }

    },
    getConfig: function () {
      return window.APP_HELPERS.getCovidAppConfig().then((function (config) {
        this.config = config;
        return true;
      }).bind(this));
    },
    emptyState: function (isTemp) {
      if (isTemp) {
        return {
          title: 'Временный сертификат о вакцинации COVID-19',
          entitle: 'COVID-19 temporary vaccination certificate',
          invalid: 'Не найден',
          eninvalid: 'Not found',
          attrs: []
        }
      }
      return {
        title: 'Сертификат о вакцинации COVID-19',
        entitle: 'Certificate of COVID-19 Vaccination',
        invalid: 'Не действителен',
        eninvalid: 'Invalid',
        attrs: []
      }
    },
    setText: function (cert) {
      var langImage = document.querySelector('.lang-image');
      document.querySelector('.main-title').innerHTML = this.getValue(cert, 'title');
      document.querySelector('.button').innerHTML = this.lang === 'ru' ? 'Закрыть' : 'Close';
      document.querySelector('.lang').innerHTML = this.lang === 'ru' ? 'RUS' : 'ENG';
      langImage.classList.remove('ru', 'en');
      langImage.classList.toggle(this.lang);
      // временные и спец серты только на русском, убираем кнопку
      if (cert.unrzFull.startsWith('4') && document.querySelector('.translate-button')) {
        document.querySelector('.translate-button').classList.toggle('hide');
      }

      if (cert.invalid) {
        var notFound = document.querySelector('.not-found');
        notFound.classList.remove('hide');
        notFound.innerHTML = this.getValue(cert, 'invalid');
      } else {
        var certName = document.querySelector('.cert-name');
        certName.classList.remove('hide');
        certName.innerHTML = this.getValue('', 'certStatusName')
      }
    },
    setAdditionalInfo: function (cert) {
      var additionalInfoElement = document.querySelector('.additional-info');
      if (cert.expired === '1' && cert.type === 'COVID_TEST') {
        var label = this.lang === 'ru' ? 'Результат' : 'Result';
        var isNegative = (cert.status + '').toLowerCase() === 'отрицательный';
        var value = (this.lang === 'ru' ? (isNegative ? 'отрицательный' : 'положительный') : (isNegative ? 'negative' : 'positive'));
        additionalInfoElement.innerHTML = label + ': ' + value;
        return;
      }
      if (additionalInfoElement) {
        additionalInfoElement.remove();
      }

    }
  }
  APP.getConfig().then(function () {
    APP.init();
  })
})();
