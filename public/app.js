var audioObject;
var currentTrack = {};
var url;

function getTracks (albumId, callback) {
  $.ajax({
    url: 'https://api.spotify.com/v1/albums/' + albumId,
    success: function (response) {
      console.log('resposne form getTrack is', response);
      callback(response);
    }
  });
}

function getAlbums (query,callback) {
  $.ajax({
    url: 'https://api.spotify.com/v1/search',
    data: {
      q: query,
      type: 'album'
    },
    success: function (response) {
      callback(response);        
    }
  });
}

function getPlayList (callback) {
  $.ajax({
    url: 'https://api.spotify.com/v1/me/playlists',
    headers: { 'Authorization': 'Bearer ' + document.cookie.slice(32)},
    success: function (response) {
      callback(response);     
    }
  });
}


function getPlayListTracks (url) {
  $.ajax({
    url: url,
    headers: { 'Authorization': 'Bearer ' + document.cookie.slice(32)},
    success: function (response) {
      document.getElementById("table").innerHTML="";
      $("<tr><th>SONG</th><th>ARTIST</th><th>ALBUM</th><</tr>").appendTo($("#table"));
      response.items.forEach(function (value, index) {
        var name = value.track.name
        var artist = value.track.artists[0].name;
        var album = value.track.album.name;
        var href = value.track.preview_url;
        createPlayListTracks(name, artist, album, href, index);
      });
        playListPlayer();
    }
  });
}

function getAudioFeatures (id, callback) {
  $.ajax({
    url: 'https://api.spotify.com/v1/audio-features',
    data: {
      ids: id
    },
    headers: { 'Authorization': 'Bearer ' + document.cookie.slice(32)},
    success: function (response) {
      callback(response);        
    }
  });
}

function populateUserPlaylist (response) {
  document.getElementById("table").innerHTML="";
  $("<tr><th>PLAYLIST NAME</th></tr>").appendTo($("#table"));
  response.items.forEach(function (value, key) {
    $("<tr id=" + "\"row\"" + "class=" + " " + ">" + "<td>" + "<div id=" + value.tracks.href + " " + "class=" + " " + ">" + "<span class=" + " " + "\"glyphicon glyphicon-music\"" + " " + ">" + "</span>" 
    + "  " + value.name + " " + "</button>" + "</td>").appendTo($("#table"));
  });
  document.getElementById("alpha").style.display = "block";
  var offsets = $('#alpha').offset();
  var top = offsets.top - 220;
  window.scrollTo(0,top);
  $("div[id^='https://api']").on('click', function(e) {
  var playListURL = $(e.currentTarget).attr('id');
    getPlayListTracks(playListURL);
  });
}

function createPlayListTracks (name, artist, album, href, index) {
  index = index + 1;
  $("<tr id=" + "\"row\"" + "class=" + " " + ">" + "<td>" + "<div id=" + href + " " + "class=" + " " + ">" + "<span class=" + " " + "\"glyphicon glyphicon-play-circle\"" + " " + ">" + "</span>" 
  + "  " + index + ". " + name + " " 
  + " " + "</button>" + "</td>" + "<td>" + artist + "</td>" + " " + "<td>" + album + "</div>" +  "</td>" + "</tr>").appendTo($("#table"));
}

function playListPlayer () {
  var offsets = $('#alpha').offset();
  var top = offsets.top - 220;
  window.scrollTo(0,top);
  document.getElementById("alpha").style.display = "block";
  $("div[id^='https://p.scdn']").on('click', function(e) {
    if (audioObject) {
      audioObject.pause();
    }
    audioObject = new Audio();
    $('#freq').slideDown('fast');
    init();
    var inputButtonClicked = $(e.currentTarget);
    if (currentTrack[inputButtonClicked.context.id]) {
      audioObject.pause();
      audioObject.addEventListener('pause', function () {
        currentTrack[inputButtonClicked.context.id] = false;  
      });
    } else {
      audioObject.pause();
      audioObject = new Audio();
      url = inputButtonClicked.attr('id');
      init();
      currentTrack[inputButtonClicked.context.id] = true;
      inputButtonClicked.addClass('playing');
      audioObject.addEventListener('pause', function () {
        currentTrack[inputButtonClicked.context.id] = false;
        inputButtonClicked.removeClass('playing');
      });      
    } 
  });
}

function populateAlbums (response) {
  document.getElementById("albumResults").innerHTML="";
  if (response["albums"]["items"].length === 0) alert("Artist Not Found");
  response["albums"]["items"].forEach(function(item) {
    var albumImg = [item][0]["images"][0]["url"];
    var albumID =  [item][0]["id"];
    $("<div" + " " + "album-id=" + albumID + " "+ "class=" +"albumTrue" +" " + "style=" +"background-image:url("+ 
    albumImg +")" + ">" + "</div>").appendTo($("#albumResults"));
    var offsets = $('#albumResults').offset();
    var top = offsets.top - 120;
    window.scrollTo(0,top);
    document.getElementById('query').value = "";
  });
}     

$('#albumResults').on('click', function (e) {
  var target = e.target;
  if (!!target && target.classList.contains('albumTrue')) {
    if (currentTrack[target.id]) {
      audioObject.pause();
    } else {
      if (audioObject) {
        audioObject.pause();
      }
      audioObject = new Audio();
      currentTrack[target.outerHTML] = true;
      target.classList.add('playing');
      audioObject.addEventListener('ended', function () {
        currentTrack[target.outerHTML] = false;
        target.classList.remove('playing');
      });
      audioObject.addEventListener('pause', function () {
        currentTrack[target.outerHTML] = false;
        target.classList.remove('playing');
      });
      trackListPlayer(target);
    }
  }
});

function trackListPlayer (target) {
  getTracks(target.getAttribute('album-id'), function (data) {
    var trackList = [];
    var bmp = "wait";
    var keySig = "wait";
    var songID = [];
    var pitch = ['C', 'C♯|D♭', 'D', 'D♯|E♭', 'E', 'F', 'F♯|G♭', 'G', 'G♯|A♭', 'A', "A♯|B♭", 'B'];
    var mode = ["Major", "Minor"];    
    data.tracks.items.forEach(function(item) {
      trackList.push([item.name, item.preview_url]);
      songID.push(item.id);
    });
    if (document.cookie && document.cookie.length > 1) {
      getAudioFeatures(songID.join(","), function (audioFeature) {
        document.getElementById("table").innerHTML="";
        $("<tr><th>SONG</th><th>ARTIST</th><th>ALBUM</th><th>BPM</th><th>KEY</th><th>MODE</th></tr>").appendTo($("#table"));
        trackList.forEach(function (value, index) {
          var audioChar = audioFeature.audio_features[index];
          $("<tr id=" + "\"row\"" + "class=" + " " + ">" + "<td>" + "<div id=" + value[1] + " " + "class=" + " " + ">" + "<span class=" + " " + "\"glyphicon glyphicon-play-circle\"" + " " + ">" + "</span>" 
          + "  " + (index + 1) + ". " + value[0] + " " 
          + " " + "</button>" + "</td>" + "<td>" + data.artists[0].name + "</td>" + " " + "<td>" + data.name + "</div>" +  "</td>" + "<td>" + parseInt(audioChar.tempo) + "</td>" + "<td>" 
          + pitch[audioChar.key] + "</td>" +  "<td>" + mode[audioChar.mode] + "</td>" + "</tr>").appendTo($("#table"));
        });
        var albumLength = Object.keys(trackList).length;
        var randomSong = Math.floor((Math.random()*albumLength));
        url = data.tracks.items[randomSong].preview_url;
        $('#freq').slideDown('fast');
        document.getElementById("alpha").style.display = "block";
        var offsets = $('#alpha').offset();
        var top = offsets.top - 220;
        window.scrollTo(0,top);
        init();
        
        $("div[id^='https://p.scdn']").on('click', function(e) {
          var inputButtonClicked = $(e.currentTarget);
          if (currentTrack[inputButtonClicked.context.id]) {
            audioObject.pause();
            audioObject.addEventListener('pause', function () {
              currentTrack[inputButtonClicked.context.id] = false;  
            });
          } else {
            audioObject.pause();
            audioObject = new Audio();
            url = inputButtonClicked.attr('id');
            init();
            currentTrack[inputButtonClicked.context.id] = true;
            inputButtonClicked.addClass('playing');
            audioObject.addEventListener('pause', function () {
              currentTrack[inputButtonClicked.context.id] = false;
              inputButtonClicked.removeClass('playing');
            });      
          } 
        });
      });
    } else if (document.cookie.length === 0) {
      document.getElementById("table").innerHTML="";
      $("<tr><th>SONG</th><th>ARTIST</th><th>ALBUM</th></tr>").appendTo($("#table"));
      trackList.forEach(function (value, index) {
        $("<tr id=" + "\"row\"" + "class=" + " " + ">" + "<td>" + "<div id=" + value[1] + " " + "class=" + " " + ">" + "<span class=" + " " + "\"glyphicon glyphicon-play-circle\"" + " " + ">" + "</span>" 
        + "  " + (index + 1) + ". " + value[0] + " " 
        + " " + "</button>" + "</td>" + "<td>" + data.artists[0].name + "</td>" + " " + "<td>" + data.name + "</div>" +  "</td>" + "</tr>").appendTo($("#table"));
      });
      var albumLength = Object.keys(trackList).length;
      var randomSong = Math.floor((Math.random()*albumLength));
      url = data.tracks.items[randomSong].preview_url;
      $('#freq').slideDown('fast');
      document.getElementById("alpha").style.display = "block";
      var offsets = $('#alpha').offset();
      var top = offsets.top - 220;
      window.scrollTo(0,top);
      init();
      
      $("div[id^='https://p.scdn']").on('click', function(e) {
        var inputButtonClicked = $(e.currentTarget);
        if (currentTrack[inputButtonClicked.context.id]) {
          audioObject.pause();
          audioObject.addEventListener('pause', function () {
            currentTrack[inputButtonClicked.context.id] = false;  
          });
        } else {
          audioObject.pause();
          audioObject = new Audio();
          url = inputButtonClicked.attr('id');
          init();
          currentTrack[inputButtonClicked.context.id] = true;
          inputButtonClicked.addClass('playing');
          audioObject.addEventListener('pause', function () {
            currentTrack[inputButtonClicked.context.id] = false;
            inputButtonClicked.removeClass('playing');
          });      
        } 
      });
    }
  });
}

$("#Stop").click(function() {
  audioObject.pause();
});

document.getElementById('search-form').addEventListener('submit', function (e) {
  e.preventDefault();
  getAlbums(document.getElementById('query').value, populateAlbums);
}, true);

$('#playlist').on('click', function () {
  getPlayList(populateUserPlaylist);
});

$('#logout').on('click', function () {
  sessionStorage.clear();
  var userID = document.cookie.slice(8, 16);
  document.cookie = "user_id" + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = "access_token" + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  $.ajax({
    url: '/logout',
    data: {
      userID: userID
    },
    success: function (response) {
      console.log('response is', response);
      window.location.assign('/');
    }
  });
});



