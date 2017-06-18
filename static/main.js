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
	hasAnyYouTubeResults = (resultWrap.rendered_html || '').length > 0;
	break;
      case 'iTunes':
	// TODO: Toggle the iTunes item
	hasAnyiTunesResults = (resultWrap.rendered_html || '').length > 0;
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

      console.log(resultWrap.rendered_html);
    switch (resultWrap.service) {
      case 'youtube':
	$youtubeResultsElement.append(resultWrap.rendered_html || '');
	break;

	break;
      case 'iTunes':
	$itunesResultsElement.append(resultWrap.rendered_html);
	break;
    }
  });

  $(".youtubePlayerCloseButton").click(playerCloseButtonOnClick);
  $(".youtubePlayButton").click(youtubePlayButtonOnClick);
  $(".itunesPlayButton").click(itunesPlayButtonOnClick);
  $(".itunesInfoTitle").click(itunesTitleOnClick);
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
