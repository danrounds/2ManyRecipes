'use strict';

// stretch:
//   get diet-specific (vegetarian, vegan) recipes
//   get recipes with specific ingredients

// to-dos:
//   add length of videos

var YUMMLY_SEARCH_URL  = 'http://api.yummly.com/v1/api/recipes';
var YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

////
function getYummlyResults(recipeTerm, state, callback) {
    var query = {
        _app_id: '4ba1f977',
        _app_key: '39f9fbb286bd0487912476146ded5807',
        maxResults: 15,
        q: recipeTerm,
        requirePictures: true
    };
    $.getJSON(YUMMLY_SEARCH_URL, query, callback).done(function(){
        displayRecipes(state);
    });
}

function getYouTubeSearch(recipeTerm, state, callback) {
    var query = {
        key: 'AIzaSyBTNjgDxhK8Valx49hGTSgVJ0wkjCYaqwk',
        part: 'snippet',
        maxResults: 15,
        q: recipeTerm + ' recipe'
    };
    $.getJSON(YOUTUBE_SEARCH_URL, query, callback).done(function(){
        displayVideos(state);
        // getVideoLengths() -- this'll probably screw up cuz async
    });
}
////

var state = {
    recipeResults: [ ],         // an array of objects =
    //  {
    //   innerHTML: elements going into our outer link,
    //   recipe_no: recipe #, to be inserted into anchor
    //  }
    v_i: 0,                      // video index

    videoResults: [], // an array of objects =
    //  {
    //   innerHTML: elements going into our outer link,
    //   video_id:  vid id to be inserted into anchor
    //  }
    r_i: 0                      // recipe index
};

function addRecipeResult(object) {
    state.recipeResults[state.r_i] = object;
    state.r_i++;
}

function addVideoResult(object) {
    state.videoResults[state.v_i] = object;
    state.v_i++;
}

function moreSearchResults(elementArray) {
    // Takes recipeResults or videoResults (arrays of HTML),
    // and shaves off the (remaining) first three elements.
    return elementArray.splice(0, 3);
}

// consider function wrapper
function populateRecipeResults(JSON) {
    JSON.matches.forEach(function(match){
        var pic = match.imageUrlsBySize[90].slice(0, -4) + '500-c';
        pic = `<img src="${pic}" alt="recipe result link"/>\n`;

        var title = `<p>${match.recipeName}</p>\n`;
        var cookMinutes = `<p>cooktime: ${match.totalTimeInSeconds/60} minutes</p>\n`;
        var ingredients = `<p>${match.ingredients.join(', ')}</p>\n`;

        var content = pic + title + ingredients + cookMinutes;
        addRecipeResult({ innerHTML:content, recipe_no:match.id });
    });
}

function populateVidResults(JSON) {
    JSON.items.forEach(function(item){
        var pic = `<img src="${item.snippet.thumbnails.high.url}"\n`;
        var title = '<p>' + item.snippet.title + '</p>\n';
        var author = '<p>' + item.snippet.channelTitle + '</p>\n';
        var content = pic + title + author;

        // var linked = `<a href="https://youtube.com/watch?v=${item.id.videoId}"`
        //         + ` target="_blank">${content}</a>`;
        // resultsElement += `<div class="video-element">${linked}</div>`;
        addVideoResult( { innerHTML:content, video_id:item.id.videoId});
    });
    console.log(state.videoResults);
}


function displayRecipes(state) {
    var resultsElement = '<h2>Recipe results</h2>';
    var elms = moreSearchResults(state.recipeResults);
    if (elms.length > 0) {
        for (var r of elms) {
            var linked = `<a href="http://www.yummly.com/recipe/`
                +`${r.recipe_no}" target="_blank">${r.innerHTML}</a>`;
            resultsElement += linked;
        }
    } else {
        resultsElement += '<p>Looks like there aren\'t any recipes for that search :(</p>';
    }
    $('.recipe-results').html(resultsElement);
}

function displayVideos(state) {
    var resultsElement = '<h2>Video results</h2>';
    var elms = moreSearchResults(state.videoResults);
    if (elms.length > 0) {
        for (var v of elms) {
            var videoLen = '0:00'
            var len = `<p>${videoLen}</p>\n`
            var linked = `<a href="https://youtube.com/watch?v=`
                +`${v.videoId}" target="_blank">${v.innerHTML+len}</a>`;
            resultsElement += linked;
        }
    } else {
            resultsElement += '<p>Looks like there aren\'t any video results :\'(';
    }
    // }
    // if (JSON.items.length > 0) {
    //     JSON.items.forEach(function(item){
    //         var pic = `<img src="${item.snippet.thumbnails.high.url}"`;
    //         var title = '<p>' + item.snippet.title + '</p>';
    //         var author = '<p>' + item.snippet.channelTitle + '</p>';
    //         var content = pic + title + author;

    //         var linked = `<a href="https://youtube.com/watch?v=${item.id.videoId}"`
    //                 + ` target="_blank">${content}</a>`;
    //         resultsElement += `<div class="video-element">${linked}</div>`;
    //     });
    // } else {
        //     resultsElement += '<p>Looks like there aren\'t any video results :\'(';
    // }
    $('.video-results').html(resultsElement);
}

function watchSubmit() {
    $('.search-form').submit(function(e){
        e.preventDefault();
        var query = $(this).find('.search-text').val();
        getYummlyResults(query, state, populateRecipeResults);
        // getYouTubeSearch(query, displayVideos);
        getYouTubeSearch(query, state, populateVidResults);
    });
}

$(function(){ watchSubmit(); });
