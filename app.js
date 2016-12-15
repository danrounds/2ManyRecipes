'use strict';
// to-dos:
//   add length of videos

var YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
var YUMMLY_SEARCH_URL  = '';

////
function getYouTubeSearch(recipeTerm, callback) {
    var query = {
        part: 'snippet',
        maxResults: 3,
        key: 'AIzaSyBTNjgDxhK8Valx49hGTSgVJ0wkjCYaqwk',
        q: recipeTerm + ' recipe'
    };
    $.getJSON(YOUTUBE_SEARCH_URL, query, callback);
}

function getYummlyResults() {
    var query = {
        // maxResults
        key: null,
    };
}

///


function displayVidResults(JSON) {
    var resultsElement = '<h2>Video results</h2>';
    if (JSON.items) {
        JSON.items.forEach(function(item){
            var pic = '<img src="' + item.snippet.thumbnails.high.url
                    + '"alt="search result picture"/>';
            var link = '<a href="https://youtube.com/watch?v=' +
                    item.id.videoId + '" target="_blank">';
            var title = '<p>' + item.snippet.title + '</p>';
            var author = '<p>' + item.snippet.channelTitle + '</p>';
            var element = link + pic + title + author;
            resultsElement += `<div class=video-element>${element}</div>`;
        });
    }
    else {
        resultsElement += '<p>Looks like there aren\'t any video results';
    }
    $('.video-results').html(resultsElement);
}



function watchSubmit() {
    $('.search-form').submit(function(e){
        e.preventDefault();
        var query = $(this).find('.search-text').val();
        // getYummlyResults(query, displayRecipes);
        getYouTubeSearch(query, displayVidResults);
    });
}


$(function(){ watchSubmit(); });


