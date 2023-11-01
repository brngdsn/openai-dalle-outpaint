const http = require('http');
const https = require('https');
const { URL } = require('url');

class RESTfulAPIClient {
  constructor(hostname, authScheme) {
    this.hostname = hostname;
    this.authScheme = authScheme;
  }

  static from(hostname, authScheme) {
    return new this(hostname, authScheme);
  }

  static async request(url) {
    // console.log({ using: true, url })
    const { hostname, pathname: path, search } = new URL(url);
    // console.log({ using: true, hostname, path, search })
    const client = new this(`https://${hostname}`)
    // console.log({ using: true, client })
    const response = await client.makeRequest(`GET`, `${path}${search}`)
    // console.log({ got: true, response })
    return response;
  }

  makeRequest(method, resource, body, options = {}) {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        hostname: this.hostname.split('https://').join('').split('http://').join(''),
        method: method,
        path: resource,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };
  
      if (this.authScheme) {
        requestOptions.headers['Authorization'] = this.authScheme;
      }
  
      if (body) {
        requestOptions.headers['Content-Length'] = Buffer.byteLength(
          JSON.stringify(body)
        );
      }
  
      const lib = this.hostname.startsWith('https') ? https : http;
      const req = lib.request(requestOptions, (res) => {
        let data = Buffer.alloc(0);
        res.on('data', (chunk) => {
          data = Buffer.concat([data, chunk])
        });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(data);
          }
        });
      });
  
      req.on('error', (error) => {
        reject(error);
      });
  
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  get(resource, options) {
    return this.makeRequest('GET', resource, undefined, options);
  }

  put(resource, body, options) {
    return this.makeRequest('PUT', resource, body, options);
  }

  post(resource, body, options) {
    return this.makeRequest('POST', resource, body, options);
  }

  delete(resource, options) {
    return this.makeRequest('DELETE', resource, undefined, options);
  }
}

module.exports = RESTfulAPIClient;