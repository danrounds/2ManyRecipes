'use strict';

// to-dos:
//   format length of videos

var YUMMLY_SEARCH_URL  = 'https://api.yummly.com/v1/api/recipes';
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
        id: makeIDQuery(state.videos.results)
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
        state.recipes = {
            i: 0,               // Index
            results: []         // Elems are HTML of displayable results
        };

        state.videos = {
            i: 0,               // Index
            results: [],        // Elems are HTML of mostly-displayable results
            // ...that need some love at display time
            IDsToLength: {}     // Mapping of video IDs to their run time.
        };                      // Inserted into the above HTML at display time
    }
};

function addRecipeResult(HTML) {
    state.recipes.results[state.recipes.i] = HTML;
    state.recipes.i++;
}

function addVideoResult(object) {
    state.videos.results[state.videos.i] = object;
    state.videos.i++;
}

function resetRecipe_i() {
    state.recipes.i = 0;
}

function resetVideo_i() {
    state.videos.i = 0;
}

function makeVidLengths(JSON) {
    JSON.items.forEach(function(item){
        console.log(JSON);
        state.videos.IDsToLength[item.id] = parseTimeStamp(item);
    });
}

function parseTimeStamp(item) {
    // You'll have to play with formatting
    var tStamp = item.contentDetails.duration;
    return tStamp.slice(2, -1).replace('M', ':');
}

function moreSearchResults(elementArray, type) {
    elementArray.i += 3;
    return elementArray.results.slice(elementArray.i-3, elementArray.i);
}

function populateRecipeResults(JSON) {
    // workhorse function, processing our recipe results into
    // an array of mostly-formed HTML
    JSON.matches.forEach(function(match){
        var pic = match.imageUrlsBySize[90].slice(0, -4) + '500-c';
        pic = '<div class="img-cover">'
            +`<img class="thumb img-responsive" src="${pic}" alt="recipe result link"/></div>\n`;

        var title = `<h5>${match.recipeName}</h5>\n`;
        var cookMinutes = `<p class="under-text">cooktime: ${match.totalTimeInSeconds/60} minutes</p>\n`;
        var ingredients = `<p class="bottom-text">${match.ingredients.join(', ')}</p>\n`;
        var content = pic + title + ingredients + cookMinutes;

        var linked = `<a href="http://www.yummly.com/recipe/`
            +`${match.id}" target="_blank">${content}</a>`;

        var divd = `<div class="col-md-4 result">${linked}</div>`;

        addRecipeResult(divd);
    });
    resetRecipe_i();
}

function populateVidResults(JSON) {
    // workhorse function, processing our video results into
    // an array of mostly-formed HTML
    JSON.items.forEach(function(item){
        var pic = `<div class="img-cover"><img class="thumb img-responsive" src="${item.snippet.thumbnails.high.url}"></div>\n`;
        var title = '<h5>' + item.snippet.title + '</h5>\n';
        var author = '<p class="bottom-text">' + item.snippet.channelTitle + '</p>\n';
        var content = pic + title + author;

        addVideoResult( { innerHTML:content, id:item.id.videoId});
    });
    resetVideo_i();
}

function stopScroll(e, callback, data) {
    e.preventDefault();
    var scrollPoint = $(window).scrollTop();
    callback(data);
    setTimeout(function(){ $(window).scrollTop(scrollPoint); }, 150);
}

function displayRecipes(state) {
    // var resultsElement = '<h2>Recipe results</h2>';
    var resultsElement = '<div class="row"><div class="col-md-12"><h2>Recipes</h2></div>';
    var elems = moreSearchResults(state.recipes, 'recipe');
    if (elems.length > 0) {
        for (var i in elems) {
            resultsElement += elems[i];
        }
        resultsElement += '</div><div class="row"><div class="col-md-1 col-md-push-11">'
            +'<button class="btn btn-warning more-recipes">more</button>'
            +'</div></div>';

        $('.recipe-results').html(resultsElement);
        $('.more-recipes').click(function(e){
            stopScroll(e, displayRecipes, state);
        });

    } else {
        if (!state.recipes.i) {
            resultsElement += '<div class="col-md-12"><p>Looks Like there aren\'t any recipes for that search :(</p></div>';
            $('.recipe-results').html(resultsElement);
        } else {
            resultsElement += '<div class="col-md-12"><p>Guess we\'re fresh out of recipes. <a href=# class="recipe-again">See \'em, again?</a></p></div>';
            $('.recipe-results').html(resultsElement);
            $('.recipe-again').click(function(e) {
                e.preventDefault();
                resetRecipe_i();
                displayRecipes(state);
            });
        }
    }
}

function displayVideos(state) {
    var resultsElement = '<div class="row"><div class="col-md-12"><h2>Videos</h2></div>';
    // var elems = moreSearchResults(state.videoResults);
    var elems = moreSearchResults(state.videos);
    if (elems.length > 0) {
        for (var v of elems) {
            var len = `<p class="under-text">${state.videos.IDsToLength[v.id]}</p>\n`;
            var linked = `<a href="https://youtube.com/watch?v=`
                +`${v.id}" target="_blank">${v.innerHTML+len}</a>`;
            var divd = `<div class="col-md-4 result">${linked}</div>`; 

            resultsElement += divd;
        }

        resultsElement += '</div><div class="row"><div class="col-md-1 col-md-push-11">'
            +'<button class="btn btn-warning more-videos">more</button>'
            +'</div></div>';

        $('.video-results').html(resultsElement);
        $('.more-videos').click(function(e) {
            stopScroll(e, displayVideos, state);
        });
    } else {
        if (!state.videos.i) {
            resultsElement += '<div class="col-md-12"><p>Looks like there aren\'t any video results :\'(</p></div>';
            $('.video-results').html(resultsElement);
        } else {      
            resultsElement += '<div class="col-md-12"><p>Guess we\'re out of YouTube vids to show you. <a href=# class="video-again">See \'em, again?</a></p>';
            $('.video-results').html(resultsElement);
            $('.video-again').click(function(e) {
                e.preventDefault();
                resetVideo_i();
                displayVideos(state);
            });
        }
    }

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
            });                       // before we /have/ results.
        });

    });
}

$(function(){ watchSubmit(); });
