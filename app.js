'use strict';

// stretch:
//   get diet-specific (vegetarian, vegan) recipes
//   get recipes with specific ingredients

// to-dos:
//   add length of videos

var YUMMLY_SEARCH_URL  = 'http://api.yummly.com/v1/api/recipes';
var YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
var YOUTUBE_VID_INQ = 'https://www.googleapis.com/youtube/v3/videos';
var YOUTUBE_KEY = 'AIzaSyBTNjgDxhK8Valx49hGTSgVJ0wkjCYaqwk';

////
function getYummlyResults(recipeTerm, callback) {
    var query = {
        _app_id: '4ba1f977',
        _app_key: '39f9fbb286bd0487912476146ded5807',
        maxResults: 15,
        q: recipeTerm,
        requirePictures: true
    };
    return $.getJSON(YUMMLY_SEARCH_URL, query, callback);

}

function getYouTubeSearch(recipeTerm, callback) {
    var query = {
        key: YOUTUBE_KEY,
        part: 'snippet',
        maxResults: 15,
        q: recipeTerm + ' recipe'
    };
    return $.getJSON(YOUTUBE_SEARCH_URL, query, callback);
}

function getVideoIDs(state){
    var query = {
        key: YOUTUBE_KEY,
        part: 'contentDetails',
        id: makeIDQuery(state.videoResults)
    };
    return $.getJSON(YOUTUBE_VID_INQ, query, makeVidLengths);
}

function makeIDQuery(videoResults) {
    var id = '';
    for (var i in videoResults) {
        id += videoResults[i].id + ','; // trailing comma doesn't matter
    }
    return id;
}

//// state & state-altering functions
var state = {
    clean: function() {
        state.v_i = 0;             // video index
        state.recipeResults = [ ]; // Array of HTML --
        // each i is a search result

        state.r_i = 0;           // recipe index
        state.videoResults = []; // Array of objects -- key:val
        //   innerHTML: elements going into our outer link,
        //   id:  vid id to be inserted into anchor
        state.IDtoLength = {};
    }
};

function addRecipeResult(HTML) {
    state.recipeResults[state.r_i] = HTML;
    state.r_i++;
}

function makeVidLengths(JSON) {
    JSON.items.forEach(function(item){
        state.IDtoLength[item.id] = parseTimeStamp(item);
    });
}

function parseTimeStamp(item) {
    // You'll have to play with formatting
    var tStamp = item.contentDetails.duration;
    return tStamp.slice(2, -1).replace('M', ':');
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

function populateRecipeResults(JSON) {
    // workhorse function, processing our recipe results into
    // an array of mostly-formed HTML
    JSON.matches.forEach(function(match){
        var pic = match.imageUrlsBySize[90].slice(0, -4) + '500-c';
        pic = `<img src="${pic}" alt="recipe result link"/>\n`;

        var title = `<p>${match.recipeName}</p>\n`;
        var cookMinutes = `<p>cooktime: ${match.totalTimeInSeconds/60} minutes</p>\n`;
        var ingredients = `<p>${match.ingredients.join(', ')}</p>\n`;
        var content = pic + title + ingredients + cookMinutes;

        var linked = `<a href="http://www.yummly.com/recipe/`
            +`${match.id}" target="_blank">${content}</a>`;

        // addRecipeResult({ innerHTML:content, recipe_no:match.id });
        addRecipeResult(linked);
    });
}

function populateVidResults(JSON) {
    // workhorse function, processing our video results into
    // an array of mostly-formed HTML
    JSON.items.forEach(function(item){
        var pic = `<img src="${item.snippet.thumbnails.high.url}"\n`;
        var title = '<p>' + item.snippet.title + '</p>\n';
        var author = '<p>' + item.snippet.channelTitle + '</p>\n';
        var content = pic + title + author;

        addVideoResult( { innerHTML:content, id:item.id.videoId});
    });
}

function displayRecipes(state) {
    var resultsElement = '<h2>Recipe results</h2>';
    var elms = moreSearchResults(state.recipeResults);
    var button = '';
    if (elms.length > 0) {
        button = '<button type="button">More!</button>';
        for (var i in elms) {
            resultsElement += elms[i];
        }
    } else {
        if (state.r_i > i) {
            resultsElement += 'Guess we\'re fresh out of recipes';
        } else {
            resultsElement += '<p>Looks Like there aren\'t any recipes for that search :(</p>';
        }
    }
    resultsElement += button;
    $('.recipe-results').html(resultsElement);
    $('button').click(function() {
        displayRecipes(state);
    });
  
}


// function displayRecipes(state) {
//     var resultsElement = '<h2>Recipe results</h2>';
//     var elms = moreSearchResults(state.recipeResults);
//     if (elms.length > 0) {
//         for (var i in elms) {
//             resultsElement += elms[i];
//         }
//     } else {
//         resultsElement += '<p>Looks like there aren\'t any recipes for that search :(</p>';
//     }
//     $('.recipe-results').html(resultsElement);
// }

function displayVideos(state) {
    var resultsElement = '<h2>Video results</h2>';
    var elms = moreSearchResults(state.videoResults);
    if (elms.length > 0) {
        for (var v of elms) {
            var videoLen = state.IDtoLength[v.id];
            var len = `<p>${videoLen}</p>\n`;
            var linked = `<a href="https://youtube.com/watch?v=`
                +`${v.id}" target="_blank">${v.innerHTML+len}</a>`;
            resultsElement += linked;
        }
    } else {
            resultsElement += '<p>Looks like there aren\'t any video results :\'(';
    }
    $('.video-results').html(resultsElement);
}

function watchSubmit() {
    $('.search-form').submit(function(e){
        e.preventDefault();
        var query = $(this).find('.search-text').val();

        state.clean();
        getYummlyResults(query, populateRecipeResults).done(function(){
            displayRecipes(state);
        });

        getYouTubeSearch(query, populateVidResults).done(function(){
            getVideoIDs(state).done(function(){
                displayVideos(state); // don't want to display results
            });                       // before we have results.
        });

    });
}

$(function(){ watchSubmit(); });
