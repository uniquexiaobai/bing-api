const express = require('express');
const axios = require('axios');
const cors = require('cors');
const qiniu = require('qiniu');
const config = require('./qiniu');

const fetchUrl = 'https://www.bing.com/HPImageArchive.aspx?format=js&n=1&mkt=zh-CN&idx=0';
const baseUrl = 'https://cn.bing.com';

const fetch = async () => {
    const res = await axios.get(fetchUrl);

    if (res.status === 200) {
        const image = res.data.images[0];
        const key = image.enddate;
        const url = baseUrl + image.url;

        return {key, url};
    }
    return {};
};

const upload = async () => {
    const {key, url} = await fetch();

    if (!key || !url) return;

    const conf = new qiniu.conf.Config();
    conf.zone = qiniu.zone.Zone_z0;
    const mac = new qiniu.auth.digest.Mac(config.ACCESS_KEY, config.SECRET_KEY);
    const manager = new qiniu.rs.BucketManager(mac, conf);

    manager.fetch(url, config.bucket, key, (err) => {
        if (err) {
            console.error(err);
        }
    });
};

upload();
setInterval(() => {
    upload();
}, 21600000); // 6h

const app = express();

app.use(cors());

app.get('/', async (req, res) => {
    try {
        const {url} = await fetch();

        if (url) {
            res.json({code: 0, data: url});
        } else {
            res.json({code: 1});
        }
    } catch (err) {
        console.error(err);
        res.json({code: 1});
    }
});

app.use((req, res, next) => {
	next();
});

app.use((err, req, res, next) => {
    console.error(err);
	res.json({code: 1});
});

process.on('uncaughtException', (err) => {
    console.error(err);
});

module.exports = app
