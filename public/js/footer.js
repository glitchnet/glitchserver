(function () {
  var footer = document.querySelector('footer');
  var network = [
    'forestdiaries.com',
    'glitch.plus',
    'noradio.net'
  ];
  var cats = ['😹', '😻', '😽'];

  network.forEach(function (n) {
    var link = document.createElement('a');
    link.href = 'http://' + n;
    link.textContent = n + ' ' + cats[Math.floor(Math.random() * (cats.length - 1))];

    var index = n.indexOf(window.location.origin.split('://')[1]);
    if (index > -1) {
      link.classList.add('on');
      link.href = '#';
    } else {
      link.href = 'http://' + n;
    }
    footer.appendChild(link);
  });
})();