document.getElementById('file').addEventListener('change', onFileSelect, false)

const TUMBLR_OAUTH = "http://www.tumblr.com/oauth/"

var tumblr_key = require('../tumblr_key.json')
var storage = require('./chromeStorage.js')
var parseURL = require('./parseURL.js')
var tumblrBlogName = ''
var wordPressPosts = []

var oauth = OAuth(jQuery.extend({
    requestTokenUrl:  TUMBLR_OAUTH +"request_token",
    authorizationUrl: TUMBLR_OAUTH +"authorize",
    accessTokenUrl:   TUMBLR_OAUTH +"access_token",
    callbackUrl:  'https://'+ chrome.i18n.getMessage("@@extension_id") +'.chromiumapp.org/provider_cb'
}, tumblr_key))

var TumblrApi = require('./TumblrApi')
tumblrApi = new TumblrApi(oauth)

var isAuthorized = false
var xmlFileString, xmlDoc
var wp2tumblrStatus = {
	"publish": "published",
	"draft": "draft"
}

var $tumblrBlogs = $("#tumblrBlogs").on('click', 'a', onBlogSelect)
var $importBtn = $("#importBtn").click(startImport)
var $linkTumblr = $("#linkTumblr")
var $status = $("#status")
var importedStatus = Handlebars.templates.importedStatus

function startImport() {
	if (tumblrBlogName && wordPressPosts.length) {
		for (var i = 0; i < wordPressPosts.length; i++) {
			tumblrApi.post(tumblrBlogName, wordPressPosts[i].title).done(createThenCb("Successfully", wordPressPosts[i])).fail(createThenCb("Failed", wordPressPosts[i].title))
		}
	}
}

function createThenCb(status, title) {
	return function() {
		$status.append( importedStatus({
			title: title,
			status: status
		}))
	}
}

function onBlogSelect() {
	$tumblrBlogs.find("a").each(function(){
		this.classList.remove("selected")
	})
	this.classList.add("selected")
	tumblrBlogName = this.dataset.name
}

storage.get("accessToken").done(function(data){
	if (data.accessToken) {
		oauth.setAccessToken.apply(oauth, data.accessToken)
		updateUnauthorizeButton()
	} else {
		requestAccessToken()
	}
})

function requestAccessToken () {
	oauth.fetchRequestToken(function(url) {
	$linkTumblr.click(function(){
		chrome.experimental.identity.launchWebAuthFlow({
			url: url,
			interactive: true
		}, onOAuthVerifier)
		return false
	})

	}, function(){
		console.error("fetchRequestToken Failed", arguments)
	})
}

function onOAuthVerifier (redirect_url) {
	if (redirect_url) {
		var params = parseURL(redirect_url).params
		oauth.setVerifier(params.oauth_verifier)
		oauth.fetchAccessToken(function(data){
			console.log("fetchAccessToken successful", data)
			storage.set({"accessToken": oauth.getAccessToken()}).
			done(function() {
				isAuthorized = true
				return tumblrApi.getCurrentUser()
			}).
			done(updateUnauthorizeButton).
			fail(authorizeTumblr)
	}, function(){
		console.error("fetchAccessToken failed", arguments)
	})


	}
	console.log(redirect_url)
}

function updateUnauthorizeButton() {
	tumblrApi.
		getCurrentUser().done(onGetCurrentUser).done(function(){
			$linkTumblr.hide()
		})
}

function authorizeTumblr(){

}

function onGetCurrentUser(data) {
	console.log(data)
	$tumblrBlogs.append( Handlebars.templates.blogs(data.user) )
}

function onFileSelect(evt) {
	var fileList = evt.target.files
	console.log(fileList)

	var importXmlFile = fileList[0]

	if (importXmlFile && importXmlFile.type == "text/xml") {
		var reader = new FileReader()
		reader.onload = importXmlFileOnLoad
		reader.readAsText(importXmlFile)
	} else {
		console.error("invalid XML file")
	}
}

function importXmlFileOnLoad (progressEvent) {
	xmlFileString = progressEvent.target.result
	xmlDoc = jQuery.parseXML(xmlFileString)
	wordPressPosts = convertToObjects($(xmlDoc))
	if (wordPressPosts.length) {
		$("li:first").find("span").html(Handlebars.templates.importStats({numberOfPosts: wordPressPosts.length}))
		$("#import").hide()
	}
}

function convertToObjects($xml) {
	var posts = []
	$xml.find("item").each(function(index, element) {
		if ( getFirstTextContentByNS(element, "wp:post_type") == "post" ) {
			posts.push(convertItem(element))
		}
	})

	console.log(posts)
	return posts
}

function convertItem(item) {
	var $item = $(item)
	var post = {
		title : $item.find("title").text(),
		date: getFirstTextContentByNS(item, "wp:post_date_gmt"),
		body: getFirstTextContentByNS(item, "content:encoded"),
		state: wp2tumblrStatus[getTextContentByNS(item, "wp:status")] || 'draft',
		slug: getFirstTextContentByNS(item, "wp:post_name"),
		type: "text"
	}
	var tags = collectTags($item)
	if (tags) {
		post.tags = tags
	}

	return post
}

function collectTags($item) {
	var tags = []
	$item.find("category[domain=post_tag]").each(function(i, e) {
		tags.push(e.textContent)
	})
	return tags.join(',')
}

function getFirstTextContentByNS(parent, name) {
	return getTextContentByNS(parent, name)[0] || ''
}

function getTextContentByNS(parent, name) {
	return getByNS(parent, name).map(function(v) {
		return v.textContent || ''
	})
}

function getByNS(parent, name) {
	var pieces = name.split(':')
	var elements = parent.getElementsByTagNameNS("*", pieces[1])
	var ret = []
	for (var i = 0; i < elements.length; i++) {
		if ( elements[i].nodeName.split(':')[0] == pieces[0] ) {
			ret.push(elements[i])
		}
	}
	return ret
}