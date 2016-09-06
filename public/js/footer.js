(function () {
  var footer = document.querySelector('footer');
  var network = [
    'forestdiaries.com',
    'glitch.plus',
    'noradio.net',
    'localhost:3000'
  ];
  var cats = ['😹', '😻', '😽'];

  var index = network.indexOf(window.location.origin.split('://')[1]);
  var reduced = [];
  var mid = network[index];

  if (index > -1) {
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
  } else {
    reduced = network.splice(0, 3);
  }

  reduced.forEach(function (n, idx) {
    var link = document.createElement('a');
    link.href = 'http://' + n;
    link.textContent = n + ' ' + cats[Math.floor(Math.random() * (cats.length - 1))];

    if (idx === 1) {
      link.classList.add('on');
      link.href = '#';
    } else {
      link.href = 'http://' + n;
    }
    footer.appendChild(link);
  });
})();