(function () {
  var footer = document.querySelector('footer');
  var network = [
    'forestdiaries.com',
    'glitch.plus',
    'noradio.net'
  ];
  var cats = ['😹', '😻', '😽'];

  var index = network.indexOf(window.location.origin.split('://')[1]);
  var reduced = [];

  if (index > -1) {
    var mid = network[index];

    switch(index) {
      case 0:
        var last = network[network.length - 1];
        reduced = [last, mid, network[index + 1]];
        break;
      case network.length - 1:
        var first = network[0];
        reduced = [network[index - 1], mid, first];
        break;
      default:
        reduced = [network[index - 1], mid, network[index + 1]];
        break;
    }
  }

  reduced.forEach(function (n) {
    var link = document.createElement('a');
    link.href = 'http://' + n;
    link.textContent = n + ' ' + cats[Math.floor(Math.random() * (cats.length - 1))];

    if (index > -1) {
      link.classList.add('on');
      link.href = '#';
    } else {
      link.href = 'http://' + n;
    }
    footer.appendChild(link);
  });
})();