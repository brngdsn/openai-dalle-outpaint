require('dotenv').config()
const express = require('express');
const RESTfullAPIClient = require('./generic/restful-api-client.js')
const { URL } = require('url');

const app = express();
const port = 8000;

app.use(express.static('public'));

app.use('/', express.static('public'));

app.use('/proxy/:url', async (req, res) => {
  try {
    const { params: { url: encoded_url } } = req
    const url = Buffer.from(decodeURIComponent(encoded_url), 'base64').toString('utf8')
    const { hostname, pathname: path, search } = new URL(url);
    const rest_client = new RESTfullAPIClient(`https://${hostname}`)
    const response_image = await rest_client.makeRequest(`GET`, `${path}${search}`)
    res.send(response_image)
  } catch (error) {
    console.log({ error: error.toString() })
    res.status(500)
    res.send({ error })
  }
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});