
const loadTemplate = (templateHtml) => {
  document.querySelector('.js-template-container').innerHTML = templateHtml;
}

const processRoute = () => {
  const path = document.location.hash || document.location.href.slice(SITE_URL.length).split('/')[0];
  if (['#create', 'create'].includes(path)) {
    loadTemplate(createPage);
    initCreateForm();
  }
  if (['#covid-cert', 'covid-cert'].includes(path)) {
    //const certData = 'eyJjZXJ0MyI6IjA3NDQiLCJjZXJ0NCI6IjAwNjkiLCJkYXRlIjoiMDQuMDYuMjAyMiIsIm5hbWUxIjoi0JoqKioqKioqKiIsIm5hbWUyIjoi0JoqKioqKiIsIm5hbWUzIjoi0J0qKioqKioqKioiLCJiZCI6IjE5OTQtMDctMTgiLCJwYXNzcG9ydDEiOiI2OTkifQ==';
    const certData = (new URLSearchParams(location.search)).get('data');
    loadTemplate(certPage(JSON.parse(decodeURIComponent(escape(window.atob(certData))))));
  }
}

const initCreateForm = () => {
  let certPartInputs = document.getElementsByClassName('js-cert-part-input');
  for (let i = 0; i < certPartInputs.length; i++) {
    certPartInputs[i].value = getRandomPartCertNumber()
  }
  
  document.getElementsByClassName('js-date-input')[0].value = getRandomDate();

  document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const encodedData = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    document.querySelector('.js-download-button').remove();
    const href = `https://gosuslygi.msk.ru/covid-cert/verify/96600000${data.cert3}${data.cert4}?lang=ru&data=${encodedData}`;
    document.querySelector('.js-link').innerHTML = `
      <a href="${href}">${href}</a>
    `;
    console.log(encodedData);
  });
}

const SITE_URL = 'https://gosuslygi.msk.ru/';

Number.prototype.addZero = function(count) {
  return (new Array(count - this.toString().length)).fill(0).join('')+this.toString()
}

function getRandomPartCertNumber() {
  return  Math.round(Math.random()*1000).addZero(4);
}

function getRandomDate() {
  let date = [
    Math.round(Math.random()*30).addZero(2),
    (Math.round(Math.random()*3) + 2).addZero(2),
    2022
  ];
  return date.join('.');
}

loadTemplate(empyPage);
processRoute();
setTimeout(_ => document.querySelector('.js-body').classList.remove('loading'), Math.random()*2000 + 1000);

window.onhashchange = _ => {
  processRoute();
}