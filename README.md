# 2ManyRecipes

## A single-page recipe scraper

### [Live version, here.](https://danrounds.github.io/2ManyRecipes/)

_2ManyRecipes_ submits API queries to YouTube and Yummly and aggregates the
results into recipe- and accompanying-video-results. The YouTube results are non-robust
(can potentially return videos other than recipe-themed ones), because Freebase
(YouTube's content-tagging database) is deprecated.

**This project was an exercise in trying to program something in (basically) ES5.
I've skipped most ES6+ niceties, and that's decent "practice." There're exceptions&#8212;
notably template strings&#8212;but they're widely supported.**

### Tech used:
* jQuery 3.1
* Bootstrap 3/FlatUI theme
* YouTube and Yummly's databases/API

### To-do:
* Add notification for when our APIs error, rather than return something useful
* Add in-page attribution to Yummly and YouTube
* Add in-app GitHub link

Recipe results, courtesy [Yummly](https://www.yummly.com/); videos courtesy 
[YouTube](http://youtube.com); background image courtesy
[patterninja.com](http://graphicdesignjunction.com).

_DR, ~~2016~~ 2018_
