// Copyright (c) 2013 by Xiaoxin Lu
// Tumblr API

module.exports = (function(){
	"use strict";

	var TUMBLR_API = "http://api.tumblr.com/v2/"

	function Api(oauth) { this.oauth = oauth }

	Api.prototype.getCurrentUser = function getCurrentUser() {
		return oauthGetJson.call(this, "user/info")
	}

	Api.prototype.getLikes = function getLikes(offset) {
		return oauthGetJson.call(this, "user/likes?limit=50&offset="+ (0|offset))
	}

	Api.prototype.getDashboard = function getDashboard(options) {
		return oauthGetJson.call(this, "user/dashboard?"+ $.param(options))
	}

	Api.prototype.getAllLikes = function getAllLikes() {
		var deferred = $.Deferred(),
			likedCache = [],
			offset = 0,
			that = this

		this.getLikes().done(likeMap).fail(deferred.reject)
		return deferred.promise()

		function likeMap(data) {
			likedCache = likedCache.concat(data.liked_posts)
			offset = likedCache.length

			if (offset < data.liked_count) {
				that.getLikes(offset).done(likeMap).fail(deferred.reject)
			} else {
				deferred.resolve(likedCache)
			}
		}
	}

	Api.prototype.post = function post(blogName, blogPost) {
		return oauthPostJson.call(this, ["blog", blogName+'.tumblr.com', "post"].join('/'), blogPost)
	}

	Api.prototype.likePost = function likePost(blogPost) {
		checkBlogPostParam(blogPost)
		return oauthPostJson.call(this, "user/like", blogPost)
	}

	Api.prototype.unlikePost = function unlikePost(blogPost) {
		checkBlogPostParam(blogPost)
		return oauthPostJson.call(this, "user/unlike", blogPost)
	}

	Api.prototype.getPhotosFor = function getPhotosFor(blogName, config) {
		var params = $.extend({
			offset: 0,
			limit: 50,
			api_key: this.oauth.getConsumerKey(),
			type: 'photo'
		}, config);

		delete params.name

		// api.tumblr.com/v2/blog/{base-hostname}/posts[/type]?api_key={key}&[optional-params=]

		if (this.hasAccessToken()) {
			return oauthGetJson.call(this,  ['blog/', blogName, '/posts/photo?', jQuery.param(params)].join(''))
		} else {

			var deferred = $.Deferred()

			var url = [TUMBLR_API, 'blog/', blogName, '/posts/photo?', jQuery.param(params)].join('')

			$.ajax({
				url : url,
				dataType : "json"
			}).done(function(d) {
				deferred.resolve(d.response)
			}).fail(deferred.reject)

			return deferred.promise()
		}
	}

	Api.prototype.hasAccessToken = function hasAccessToken() {
		return this.oauth && this.oauth.getAccessTokenKey() && this.oauth.getAccessTokenSecret()
	}

	function checkBlogPostParam (post) {
		if (!post || !post.id || !post.reblog_key) throw new Error("Invalid parameters")
	}

	function oauthPostJson(method, data) {
		var deferred = $.Deferred()
		if (this.hasAccessToken()) {
			console.log("oauthPostJson", data)
			this.oauth.post(TUMBLR_API + method, data, $.proxy(callbackCheckNoData, this, deferred), $.proxy(callbackFailed, this, deferred))
		} else {
			oauthReject(deferred)
		}
		return deferred.promise()
	}

	function oauthGetJson(method) {
		var deferred = $.Deferred()
		if (this.hasAccessToken()) {
			console.log("has access token")
			this.oauth.getJSON(TUMBLR_API+ method, $.proxy(callbackCheck, this, deferred), $.proxy(callbackFailed, this, deferred))
		} else {
			oauthReject(deferred)
		}
		return deferred.promise()
	}

	function oauthReject(deferred) {
		console.log("no access token")
		deferred.reject("This API call requires oAuth Access Token.")
	}


	function callbackFailed(deferred, data) {
		console.error("API call failed.", data)
		deferred.reject(data)
	}

	function callbackCheckNoData(deferred, data) {
		// console.log(arguments)
		if (data.text) {
			data =  JSON.parse(data.text)
		}
		if (data && data.meta.status == 200 || data.meta.status == 201) {
			deferred.resolve()
		} else {
			deferred.reject()
		}
	}

	function callbackCheck(deferred, data) {
		// console.log(arguments)
		if (data && data.meta.status == 200) {
			deferred.resolve(data.response)
		} else {
			deferred.reject(data)
		}
	}

	return Api
})()
