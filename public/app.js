var audioObject = new Audio;
var currentTrack = {};
var url;

function fetchTracks (albumId, callback) {
  $.ajax({
    url: 'https://api.spotify.com/v1/albums/' + albumId,
    success: function (response) {
      callback(response);
    }
  });
}

function searchAlbums (query,callback) {
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

function populateAlbums (response) {
  document.getElementById("albumResults").innerHTML = " ";
  if (response["albums"]["items"].length === 0) alert("Artist Not Found");
  response["albums"]["items"].forEach(function(item) {
    var albumImg = [item][0]["images"][0]["url"];
    var albumID =  [item][0]["id"];
    $("<div" + " " + "album-id=" + albumID + " "+ "class=" +"albumTrue" +" " + "style=" +"background-image:url("+ 
    albumImg +")" + ">" + "</div>").appendTo($("#albumResults"));
    window.scrollTo(0,720);
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
  fetchTracks(target.getAttribute('album-id'), function (data) {
    var trackList = {};    
    data.tracks.items.forEach(function(item) {
      trackList[item.name] = [item.preview_url, item.track_number];
    });
    document.getElementById("table").innerHTML = "";
    $("<tr><th>SONG</th><th>ARTIST</th><th>ALBUM</th><</tr>").appendTo($("#table"));
    $.each(trackList, function(key,value) {
      $("<tr id=" + "\"row\"" + "class=" + " " + ">" + "<td>" + "<div id=" + value[0] + " " + "class=" + " " + ">" + "<span class=" + " " + "\"glyphicon glyphicon-play-circle\"" + " " + ">" + "</span>" 
      + "  " + value[1] + ". " + key + " " 
      + " " + "</button>" + "</td>" + "<td>" + data.artists[0].name + "</td>" + " " + "<td>" + data.name + "</div>" +  "</td>" + "</tr>").appendTo($("#table"));
    });
    var albumLength = Object.keys(trackList).length;
    var randomSong = Math.floor((Math.random()*albumLength));
    url = data.tracks.items[randomSong].preview_url;
    $('#freq').slideDown('fast');
    document.getElementById("alpha").style.display = "block";
    window.scrollTo(0,500);
    init();
          
    $("div[id^='http']").on('click', function(e) {
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
}

Stop.addEventListener("click", function() {
  audioObject.pause();
});

document.getElementById('search-form').addEventListener('submit', function (e) {
  e.preventDefault();
  searchAlbums(document.getElementById('query').value,populateAlbums);
}, true);
