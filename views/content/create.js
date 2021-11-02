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


(() => {
  let certPartInputs = document.getElementsByClassName('js-cert-part-input');
  for (let i = 0; i < certPartInputs.length; i++) {
    certPartInputs[i].value = getRandomPartCertNumber()
  }
  
  document.getElementsByClassName('js-date-input')[0].value = getRandomDate();

})()