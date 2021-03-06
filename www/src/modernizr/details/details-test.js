/*!
{
  "name": "details Element",
  "caniuse": "details",
  "property": "details",
  "tags": ["elem"],
  "builderAliases": ["elem_details"],
  "authors": ["@mathias"],
  "notes": [{
    "name": "Mathias' Original",
    "href": "http://mths.be/axh"
  }]
}
!*/
Modernizr.addTest('details', function() {
  var el = document.createElement('details'),
  	diff;

  // return early if possible; thanks @aFarkas!
  if (!('open' in el)) {
    return false;
  }

  Modernizr.testStyles('#modernizr details{display:block}', function( node ) {
    node.appendChild(el);
    el.innerHTML = '<summary>a</summary>b';
    diff = el.offsetHeight;
    el.open = true;
    diff = diff != el.offsetHeight;
  });


  return diff;
});