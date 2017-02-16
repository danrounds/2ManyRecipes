'use strict';

var YUMMLY_SEARCH_URL  = 'https://api.yummly.com/v1/api/recipes';
var YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
var YOUTUBE_VID_INQ = 'https://www.googleapis.com/youtube/v3/videos';
var YOUTUBE_KEY = 'AIzaSyBTNjgDxhK8Valx49hGTSgVJ0wkjCYaqwk';

//// API-query functions
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
            i: 0,               // index
            results: []         // [] of HTML, of displayable results
        };

        state.videos = {
            i: 0,               // index
            results: [],        // [] of HTML, of mostly-displayable results
            // -- that need some love at display time (i.e. in displayVideos)
            IDsToLength: {}     // Mapping of video IDs to their run length.
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
        state.videos.IDsToLength[item.id] = parseTimeStamp(item);
    });
}

function parseTimeStamp(item) {
    // converts YouTube's database string format to a human-readable one
    var time = item.contentDetails.duration.slice(2, -1).split('M');
    var tStamp = '0:';
    if (time.length > 1) {
        tStamp = time.shift() + ':';
    }
    if (time[0].length == 1) { time[0] = '0' + time[0]; }
    return tStamp + time[0];
}

function moreSearchResults(object) {
    // returns more results, in a form fit for displayRecipes or displayVideos
    object.i += 3;
    return object.results.slice(object.i-3, object.i);
}

// Basic pre-display & display-functions
function populateRecipeResults(JSON) {
    // workhorse function, processes our recipe results into an array of mostly
    // -formed HTML
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
    // workhorse function, processing our video results into an array of mostly
    // -formed HTML
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
    setTimeout(function(){ $(window).scrollTop(scrollPoint); }, 175);
    // millisecond value might need tweaking; via trial and error, it seems fine
}

// function stopScroll(e, callback, data) {
//     callback(data);
// }

function addButton(_class) {
    return '<div class="row"><div class="col-md-12"><div class="col-md-1 col-md-push-11">'
        +`<button class="btn btn-warning ${_class}">more</button>`
        + '</div></div></div>';
}

// function addRepeatResults(_class, data, reset, displayFn) {
function addRepeatResults(_class, data, displayFn) {
    $(_class).click(function(e) {
        e.preventDefault();
        // reset();
        data.i = 0;
        displayFn(data);
    });

}

function displayRecipes(recipes) {
    // Changes the page-HTML to display our recipe results (or lack, thereof)
    // and inserts event handlers, so we can view `more results'

    $('h2#recipes-title').text('Recipes');
    // var resultsElement = '<div class="col-md-12"><h2>Recipes</h2></div>';
    var resultsElement = '';
    var elems = moreSearchResults(recipes);
    if (elems.length > 0) {
        // We have more results
        for (var i in elems) {
            resultsElement += elems[i];
        }
        resultsElement += '</div>' + addButton('more-recipes');

        $('#recipes').html(resultsElement);
        $('.more-recipes').click(function(e){
            stopScroll(e, displayRecipes, recipes);
        });

        $('.more-recipes').click(function(e){
            stopScroll(e, displayRecipes, recipes);
        });


    } else {
        // No results
        if (!recipes.i) {
            // No results
            resultsElement += '<div class="col-md-12"><p>Looks Like there aren\'t any recipes for that search :(</p></div>';
            $('#recipes').html(resultsElement);

        } else {
            // We had results (and now we'll loop 'em)
            resultsElement += '<div class="col-md-12"><p>Guess we\'re fresh out of recipes. <a href=# class="recipe-again">See \'em, again?</a></p></div>';
            $('#recipes').html(resultsElement);
            addRepeatResults('.recipe-again', recipes, displayRecipes);
        }
    }
}

// function displayVideos(state) {
function displayVideos(videos) {
    // Changes the page-HTML to display our video results (or lack, thereof),
    // and inserts event handlers, so we can view `more results'

    var resultsElement = '<div class="col-md-12"><h2>Videos</h2></div>';
    // var elems = moreSearchResults(state.videos);
    var elems = moreSearchResults(videos);
    if (elems.length > 0) {
        for (var v of elems) {
            // We have more videos
            var len = `<p class="under-text">${videos.IDsToLength[v.id]}</p>\n`;
            var linked = `<a href="https://youtube.com/watch?v=`
                +`${v.id}" target="_blank">${v.innerHTML+len}</a>`;
            var divd = `<div class="col-md-4 result">${linked}</div>`; 

            resultsElement += divd;
        }
        resultsElement += '</div>' + addButton('more-videos');

        $('#videos').html(resultsElement);
        $('.more-videos').click(function(e) {
            stopScroll(e, displayVideos, videos);
        });
    } else {
        // No videos
        if (!videos.i) {
            resultsElement += '<div class="col-md-12"><p>Looks like there aren\'t any video results :\'(</p></div>';
            $('#videos').html(resultsElement);
        } else {
            // We had videos (and now we'll loop 'em)
            resultsElement += '<div class="col-md-12"><p>Guess we\'re out of YouTube vids to show you. <a href="#" class="video-again">See \'em, again?</a></p>';
            $('#videos').html(resultsElement);
            addRepeatResults('.video-again', videos, displayVideos);
        }
    }
}

// Submission event handler
function watchSubmit() {
    $('.search-form').submit(function(e){
        e.preventDefault();
        var query = $(this).find('.search-text').val();

        state.clean();
        getYummlyResults(query, populateRecipeResults).done(function(){
            displayRecipes(state.recipes);
        });

        getYouTubeSearch(query, populateVidResults).done(function(){
            getVideoIDs(state).done(function(){
                displayVideos(state.videos); // don't want to display results
            });                       // before we /have/ results.
        });

    });
}

$(function(){ watchSubmit(); });
