const express = require('express');
const axios = require('axios');
const cors = require('cors');

const fetchUrl = 'https://www.bing.com/HPImageArchive.aspx?format=js&n=1&mkt=zh-CN&idx=0';
const baseUrl = 'https://cn.bing.com';

const app = express();

app.use(cors());

app.get('/', (req, res) => {
	axios.get(fetchUrl)
		.then((response) => {
			if (response.status === 200) {
				const url = baseUrl + response.data.images[0].url;

				res.json({code: 0, data: url});
			} else {
				res.json({code: 1});
			}
		})
		.catch((err) => {
			res.json({code: 1});
		});
});

app.use((req, res, next) => {
	next();
});

app.use((err, req, res, next) => {
	res.json({code: 1});
});

const port = 3000;

app.listen(port, () => {
	console.log('server is running in ' + port);
});
