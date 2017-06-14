function playerCloseButtonOnClick() {
	$(".playerCover").hide();
}

function youtubePlayButtonOnClick() {
	alert("clicked");
	$(".playerCover").show();
}

$( document ).ready(function() {
	$(".youtubePlayerCloseButton").click(playerCloseButtonOnClick);
	$(".youtubePlayButton").click(youtubePlayButtonOnClick);
});
