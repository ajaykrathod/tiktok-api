const express = require('express');
const app = express();
const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser')
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.listen(process.env.PORT || 5000)


app.get('/',(req,res) => res.send("Hello From Deta"))

app.get('/oauth', (req, res) => {
    const CLIENT_KEY = 'awdal9gt8t7xxk3x' 
    const SERVER_ENDPOINT_REDIRECT = "https://feedlink.vercel.app"
    const csrfState = Math.random().toString(36).substring(2);
    res.cookie('csrfState', csrfState, { maxAge: 60000 });

    let url = 'https://open-api.tiktok.com/platform/oauth/connect/';

    url += '?client_key=awdal9gt8t7xxk3x';
    url += '&scope=user.info.basic,video.list';
    url += '&response_type=code';
    url += '&redirect_uri=https://29fy3r.deta.dev/redirect';
    url += '&state=' + csrfState;
    console.log(url)
    res.redirect(url);
})


app.get('/redirect', (req, res) => {
    const { code, state } = req.query;
    const { csrfState } = req.cookies;

    if (state !== csrfState) {
        res.status(422).send('Invalid state');
        return;
    }

    let url_access_token = 'https://open-api.tiktok.com/oauth/access_token/';
    url_access_token += '?client_key=awdal9gt8t7xxk3x';
    url_access_token += '&client_secret=356c54ae832617daf1ba96393fbf32e8';
    url_access_token += '&code=' + code;
    url_access_token += '&grant_type=authorization_code';

    fetch(url_access_token, {method: 'post'})
        .then(res => res.json())
        .then(json => {
            res.send(json);
        });
})

app.get('/refresh_token', (req, res) => {
    const refresh_token = req.query.refresh_token;

    let url_refresh_token = 'https://open-api.tiktok.com/oauth/refresh_token/';
    url_refresh_token += '?client_key=awdal9gt8t7xxk3x';
    url_refresh_token += '&grant_type=refresh_token';
    url_refresh_token += '&refresh_token=' + refresh_token;

    fetch(url_refresh_token, {method: 'post'})
        .then(res => res.json())
        .then(json => {
            res.send(json);
        });
})

app.get('/revoke', (req, res) => {
    const { open_id, access_token } = req.query;

    let url_revoke = 'https://open-api.tiktok.com/oauth/revoke/';
    url_revoke += '?open_id=' + open_id;
    url_revoke += '&access_token=' + access_token;

    fetch(url_revoke, {method: 'post'})
        .then(res => res.json())
        .then(json => {
            res.send(json);
        });
})

app.post('/user/info',(req,res) => {
        const { open_id, access_token } = req.query;
        let url_user_info = 'https://open-api.tiktok.com/user/info/';
        url_user_info += '?open_id=' + open_id;
        url_user_info += '&access_token' += access_token;

        fetch(url_user_info,{method: 'post'})
            .then(res => res.json())
            .then(json => {
                res.send(json)
            });
})


app.get('/user/video', (req, res) => {
    const { open_id, access_token } = req.query;

    let url_video_info = 'https://open-api.tiktok.com/video/list/';
    url_video_info += '?open_id=' + open_id;
    url_video_info += '&access_token=' + access_token;
    if (req.query.cursor) {
        url_video_info += '&cursor=' + req.query.cursor;
    }
    if (req.query.max_count) {
        url_video_info += '&max_count=' + req.query.max_count;
    }

    fetch(url_video_info)
        .then(res => res.json())
        .then(json => {
            res.send(json);
        });
})


// export 'app'
module.exports = app