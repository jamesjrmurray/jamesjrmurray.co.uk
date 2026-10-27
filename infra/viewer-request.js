// dev/stage password prompt. deploy-stack.sh fills AUTH in from SSM at deploy time (the expected Basic
// Authorization header, also used by the smoke test); it stays empty in the repo and on prod, leaving the site open.
var AUTH = '';
// CANONICAL_HOST: the site's own domain (deploy-stack.sh fills it in). Other hosts, such as www or the
// raw *.cloudfront.net address, 301 to it. Empty falls back to stripping www only.
var CANONICAL_HOST = '';

function hasPassword(request) {
  return AUTH !== '' && request.headers.authorization !== undefined && request.headers.authorization.value === AUTH;
}

function queryString(request) {
  var qs = [];
  for (var key in request.querystring) {
    qs.push(encodeURIComponent(key) + '=' + encodeURIComponent(request.querystring[key].value));
  }
  return qs.length ? '?' + qs.join('&') : '';
}

function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value : '';

  if (AUTH && !hasPassword(request)) {
    return {
      statusCode: 401,
      statusDescription: 'Unauthorized',
      headers: { 'www-authenticate': { value: 'Basic realm="Preview", charset="UTF-8"' } },
    };
  }

  var target = CANONICAL_HOST ? (host !== CANONICAL_HOST ? CANONICAL_HOST : '') : (host.indexOf('www.') === 0 ? host.substring(4) : '');
  if (target) {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: 'https://' + target + request.uri + queryString(request) },
      },
    };
  }

  var uri = request.uri;
  // /404.html is the body CloudFront sends with every 404; asked for directly it is missing too.
  if (uri === '/404.html') {
    request.uri = '/404/missing';
    return request;
  }
  if (uri.charAt(uri.length - 1) === '/') {
    request.uri = uri + 'index.html';
  } else if (uri.substring(uri.lastIndexOf('/') + 1).indexOf('.') === -1) {
    request.uri = uri + '/index.html';
  }
  return request;
}
