$(function() {
var resp = new Resp({
  "itemId": "searchInput",
  "apiKey": "fe4123b3-ad36-44f7-9a5b-0ea8c3abc813",
  "initialSearch": initialKeyword,
  "onMessage": handleNewData,
  "onDisconnected": turnOnSpinnerGIF,
  "onConnected": turnOffSpinnerGIF,
  "onError": function(err) {
    console.log('encountered an error', err);
  },
  "services": {
    "gifs": {},
    "youtube": {},
    "iTunes": {},
  }
});

var $resultsElement = $('.results');
var $itunesResultsElement = $('#itunesResults');
var $youtubeResultsElement = $('#youtubeResults');
var $searchInputElement = $('.searchInput');
var $itunesIconElement = $('#itunesHere');
var $youtubeIconElement = $('#youtubeHere');
var $window = $(window);

function handleNewData(data) {
  $resultsElement.empty();
  if (!(data.results)) {
    return;
  }

  $itunesResultsElement.empty();
  $youtubeResultsElement.empty();

  // Check if itunes is present
  var hasAnyiTunesResults = false;
  var hasAnyYouTubeResults = false;

  data.results.forEach(function(resultWrap) {
    if (!resultWrap)
      return;

    switch (resultWrap.service) {
      case 'youtube':
	// TODO: Toggle the YouTube item
	hasAnyYouTubeResults = (resultWrap.results || []).length > 0;
	break;
      case 'iTunes':
	// TODO: Toggle the iTunes item
	hasAnyiTunesResults = (resultWrap.results || []).length > 0;
	break;
    }
  });

  var youtubeResultsAfter = '';
  var iTunesResultsAfter = '';
  var iTunesIndent = '';
  var youtubeIndent = '';

  if (hasAnyYouTubeResults) {
    youtubeIndent = ' ';
    $(".resultSubGroupItunes").removeClass("resultsubGroupMax");
    $(".resultSubGroupYoutube").show();
  } else {
    $(".resultSubGroupYoutube").hide();
    $(".resultSubGroupItunes").addClass("resultsubGroupMax");
  }

  if (hasAnyiTunesResults) {
    itunesIndent = ' ';
    $(".resultSubGroupYoutube").removeClass("resultsubGroupMax");
    $(".resultSubGroupItunes").show();
  } else {
    $(".resultSubGroupItunes").hide();
    $(".resultSubGroupYoutube").addClass("resultsubGroupMax");
  }

  data.results.forEach(function(resultWrap) {
    if (!resultWrap)
      return;

    switch (resultWrap.service) {
      case 'youtube':
	// TODO: Toggle the YouTube item
	var items = resultWrap.results || [];
	items.forEach(function(result) {
	  $youtubeResultsElement.append(makeYouTubeSnippet(data, result, youtubeIndent));
	});
	break;

	break;
      case 'iTunes':
	// TODO: Toggle the iTunes item
	//
	var items = resultWrap.results || [];
	items.forEach(function(result) {
	  $itunesResultsElement.append(makeiTunesSnippet(data, result, youtubeIndent));
	});
	break;
    }
  });

  $itunesResultsElement.append(iTunesResultsAfter);
  $youtubeResultsElement.append(youtubeResultsAfter);

  $(".youtubePlayerCloseButton").click(playerCloseButtonOnClick);
  $(".youtubePlayButton").click(youtubePlayButtonOnClick);
  $(".itunesPlayButton").click(itunesPlayButtonOnClick);
  $(".itunesInfoTitle").click(itunesTitleOnClick);
}

function makeYouTubeSnippet(data, result) {
  if (!(result && result.id))
    return '';

  var thumbnail = youtubeThumbnail(result);

  var elem = '' +
    '<div class="cardWrapper">' +
    '	<div class="card youtubeCard">' +
    '	  <div class="youtubeCover" style="background-image:url(\'' + thumbnail.url + '\');">'+
    '	    <div class="youtubePlayButton">' +
    '	      <div class="yt-url" data-value="' + result.id + '"></div>'+
    '	      <i class="fa fa-play" aria-hidden="true"></i>'+
    '	    </div>'+
    '	  </div>' +
    '	  <div class="youtubeInfo">'+
    '	    <div class="youtubeInfoTitle">' + result.title +
    '	    </div>' +
    '	  </div>' +
    '	</div>' +
    '</div>';

  return elem;
}

function makeiTunesSnippet(data, result, indent) {
  var thumbnailURL = iTunesThumbnailURL(result);
  
  var previewElementElement = [
    '<div class="cardWrapper">',
    '	<div class="card itunesCard">' ,
    '	  <div class="itunesCoverWrapper">',
    '	    <img src="' + thumbnailURL + '" />',
    '	  </div>', 
    '	<div class="itunesPlayButton" data-data=\'' + JSON.stringify(result) + '\' id="' + result.track_id + '">',
    '	  <i class="fa fa-play" aria-hidden="true">',
    '	    <a href="' + result.track_view_url + '" />',
    '	  </i>',
    '	</div>',
    '	<div class="itunesInfo">',
    '	  <div class="itunesInfoTitle" data-btn=\'{"id":' + result.track_id + '}\'>' + (result.track_censored_name || result.title) + '</div>',
    '	  <div class="itunesInfoArtist"><a href="' + result.artist_view_url + '" target="_blank">' + result.artist_name + '</a></div>',
  ] ;

  if (result.collection_name) {
    previewElementElement.push(
    '	  <div class="itunesInfoTitle"><a href="' + result.collection_view_url + '" target="_blank">' + result.collection_name + '</a></div>'
    );
  }

  if (result.track_price && result.currency) {
    previewElementElement.push(
    '	  <div class="itunesInfoPrice"><a href="' + result.track_view_url + '" target="_blank">Buy it at ' + result.track_price+ ' ' + result.currency + '</a></div>'
    );
  }

  previewElementElement.push(
    '	</div>',
    '</div>'
  );
  previewElement = previewElementElement.join((indent || '') + '\n');
  return previewElement;
}

function iTunesThumbnailURL(result) {
  if (result.artwork_url_100 !== '')
    return result.artwork_url_100;
  if (result.artwork_url_60 !== '')
    return result.artwork_url_60
  if (result.artwork_url_30 !== '')
    return result.artwork_url_30
  return '';
}

function youtubeThumbnail(result) {
  if (!(result && result.thumbnails))
    return {};

  var thumbnails = result.thumbnails;
  if (thumbnails.medium)
    return thumbnails.medium;

  return thumbnails.high || thumbnails.low || {};
}

function playerCloseButtonOnClick() {
  var ytPlayer = getYoutubePlayer();
  ytPlayer.html('');
  try {
    jwplayer().remove();
  } catch(ex) {
  }
  $(".playerCover").hide();
}

function itunesTitleOnClick(event) {
  var curTarget = event.currentTarget;
  var btnId = $(curTarget).data('btn');
  var theButton = $("#" + btnId.id);
  _itunesPlayButtonOnClick(theButton);
}

function itunesPlayButtonOnClick(event) {
  var curTarget = event.currentTarget;
  _itunesPlayButtonOnClick(curTarget);
}

function _itunesPlayButtonOnClick(curTarget) {
  var data = $(curTarget).data('data');
  var trackViewURL = data.preview_url;

  // Let's create the element first
  var elem = $(".itunesPlayerHere");
  jwplayer("itunesPlayerHere").setup({
    file: trackViewURL,
    image: iTunesThumbnailURL(data),
    stretching: "uniform",
  });

  var ytPlayer = getYoutubePlayer();
  var li = elem.html();
  ytPlayer.html(li);
  $(".playerCover").show();
}

function youtubePlayButtonOnClick(event) {
  var curTarget = event.currentTarget;
  var first = $(curTarget).children('.yt-url').first();
  var youtubeId = first.data('value');

  var embedURL = 'https://www.youtube.com/embed/' + youtubeId + '?autoplay=1';
  var ytIframe = '<iframe id="ytplayer" type="text/html" width="100%" height="100%" src="' + embedURL + '" frameborder="0" allowfullscreen></iframe>';

  var ytPlayer = getYoutubePlayer();
  ytPlayer.html(ytIframe);
  $(".playerCover").show();
}

function getYoutubePlayer() {
  return $(".playerCover").children(".playerWrapper").first().children(".youtubePlayer").first();
}

function turnOnSpinnerGIF() {
  $(".loadingSpinnerGIF").show();
}

function turnOffSpinnerGIF() {
  $(".loadingSpinnerGIF").hide();
}
});
