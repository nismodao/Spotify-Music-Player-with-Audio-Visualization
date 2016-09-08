require('dotenv').config()
var express       = require('express');
var bodyParser    = require('body-parser');
var app           = express();
var request       = require('request');
var querystring   = require('querystring');
var cookieParser  = require('cookie-parser');
var jsrender      = require('jsrender');
var PORT          = process.env.PORT || 3000;
var client_id     = process.env.client_id;
var client_secret = process.env.client_secret;
var scope         = 'user-top-read playlist-read-private';
var redirect_uri  = 'https://nismospotify.herokuapp.com/auth/callback/';
var access_token;
var user_id;
var display_name;
var users = {};


var randomString = function (length) {
  var string = '';
  var potential = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    string += potential[(Math.floor(Math.random() * potential.length))];
  }
  return string;
}
var stateKey = 'spotify_state';

app.engine('html', jsrender.__express); 
app.set('view engine', 'html'); 
app.set('views', __dirname + '/public/template'); 
app.use(express.static(__dirname + '/public')).use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function (req, res) {
  var currUser = req.cookies["user_id"];
  display_name = undefined;
  if (users[currUser]) display_name = users[currUser].displayName;
  res.render('index.html', {userName: display_name});
})

app.get('/user', function (req, res) {
  res.render('index.html', {userName: display_name});
})

app.get('/login', function (req, res) {
  var state = randomString(25);
  res.cookie(stateKey, state, { secure: true });
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
      show_dialog: true
    }));
});

app.get('/logout', function (req, res) {
  var user = req.query.userID;
  console.log('user form logout', user);
  delete users[user];
  display_name = undefined;
  access_token = undefined;
  user_id      = undefined;
  console.log('users form logout', users);
  res.render('index.html', {userName: display_name});
});

app.get('/auth/callback', function (req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  console.log('state is', state);
  var clientState = req.cookies ? req.cookies[stateKey] : null;
  console.log('clientState', clientState);
  if (state === null || state !== clientState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
    }));
  } else {
    res.clearCookie(stateKey);
    var oAuth = {
      grant_type: "authorization_code", 
      code: code, 
      redirect_uri: redirect_uri,
      client_id: client_id,
      client_secret: client_secret
    };
    request.post({url: 'https://accounts.spotify.com/api/token', form: oAuth, json: true}, function (error, response, body) {
      if (error) {
        console.log('error is', error);
      }
      access_token = body.access_token;
      var options = {
        url: 'https://api.spotify.com/v1/me',
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
      };
      request.get(options, function(error, response, body) {
        display_name = body.display_name;
        user_id = body.id;
        users[user_id] = {accessToken: access_token, clientID: client_id, displayName: display_name};
        console.log("logged in", users);
        res.cookie("user_id", user_id, {secure: true, maxAge: 3600000});
        res.cookie("access_token", users[user_id].accessToken, {secure: true, maxAge: 3600000});
        res.redirect('/user');
      });
    });
  }
});

app.get('/playlist', function (req, res) {
  var currUser = req.query.userID;
  if (users[currUser]) {
  res.send(JSON.stringify({access_token: users[currUser].accessToken, client_id: client_id, 
  user_id: users[currUser].clientID}));
  } else {
    res.redirect('/#' + querystring.stringify({
      error: 'user not found'
    }));
  }
});

app.listen(PORT, function () {
  console.log('Express listening on port ' + PORT + '!');
});

