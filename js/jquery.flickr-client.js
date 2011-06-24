;
(function($) {
	/**
	 * return HashMap by HashMap's key sorted. 
	 * 
	 * @return
	 */
	function ksort(params) {
		var keys = [];
		
		$.each(params, function(key, val){
			keys.push(key);
		});
		keys.sort();

		sorted = {};
		$.each(keys, function(idx, key){
			if (!( params[key] == "" || params[key] == null )) {
				sorted[key] = params[key];
			}
		});
		
		return sorted;
	};
	
	/**
	 * Convert HashMap to query string.
	 */
	function hash2query(params) {
		var query = "";
		
		$.each(params, function(key, val){
			var _query = "";
			if ($.isArray(val)) {
				$.each(val, function(idx, _val){
					if (query.length>0) _query += "&";
					_query += key + "[]=" + val;
				});
			} else {
				_query = key + "=" + val;
			}
			
			if (query.length>0) query += "&";
			query += _query;
		});
		
		return query;
	};
	
	function FlickrClient(options) {
		this.options = $.extend(FlickrClient.prototype.DEFAULT_OPTIONS, options);
	}
	FlickrClient.prototype.DEFAULT_OPTIONS = {
		apiKey: "",
		apiSecret: "",
		userId: "",
		oauthToken: "",
		restEndpoint: "http://api.flickr.com/services/rest/"
	};
	
	/**
	 * execute request.
	 * 
	 * @param method
	 *            Flickr method
	 * @param params
	 *            Send parameters
	 * @param callback
	 *            callback function
	 * @returns
	 */
	FlickrClient.prototype.request = function(method, params, callback) {
		params = $.extend({
			method: method,
			format: "json",
			api_key: this.options.apiKey,
			auth_token: this.options.oauthToken,
			user_id: this.options.userId
		}, params);
		
		var type = this.getHttpMethod(method);
		var url = this.options.restEndpoint;
		var async = params['async'] || true;
		delete params['async'];
		
		var callbackName = 'flickr_callback_' + Math.floor( Math.random() * 100000000 );
		window[callbackName] = function(res) {
			if ( $.isFunction(callback) ) callback(res);
			delete window[callbackName];
		};
		
		params['jsoncallback'] = callbackName;
		params = ksort(params);
		if (this.options.apiSecret) {
			params['api_sig'] = this.generateSignature(params);
		}
		params['jsoncallback'] = '?';
		
		var ajaxOption = {
			type: type,
			url: url + '?' + hash2query(params),
			async: async,
			cache: true,
			dataType: "jsonp",
			jsonp: "jsoncallback",
			jsonpCallback: callbackName,
			error: function(request, textStatus, errorThrown) {
			}
		};
		
		return $.ajax(ajaxOption);
	};
	
	/**
	 * return Http method
	 * 
	 * @param method
	 *            Flickr method
	 * @return Http method
	 */
	FlickrClient.prototype.getHttpMethod = function(method) {
		var type = "GET";
		return type;
	};

	/**
	 * calculate api_sig
	 * @return
	 */
	FlickrClient.prototype.generateSignature = function(params) {
		var sig = "";
		$.each(params, function(key, val){
//			console.log("%s=%s", key, val);
			if (val == "") {
				delete params[key];
			} else {
				sig += String(key) + String(val);
			}
		});
		
		sig = this.options.apiSecret + sig;
		return $.md5(sig);
	};
	
	FlickrClient.prototype.photos_search = function(options, callback){
			return this.request("flickr.photos.search", options, callback);
	};
	
	FlickrClient.prototype.photosets_getList = function(options, callback){
			return this.request("flickr.photosets.getList", options, callback);
	};
	FlickrClient.prototype.photosets_getPhotos = function(options, callback){
		return this.request("flickr.photosets.getPhotos", options, callback);
	};
	
	FlickrClient.prototype.tags_getListUser = function(options, callback) {
		return this.request("flickr.tags.getListUser", options, callback);
	};
	
	FlickrClient.prototype.getPhotoUrl = function(photo, size) {
		size = size || "m";
		return photo["url_"+size];
	};

	FlickrClient.prototype.getPhotoPageUrl = function(photo, photos) {
		owner = 'owner' in photo ? photo['owner'] : null;
		if (!owner && 'owner' in photos) {
			owner = photos['owner'];
		}

		url = "http://www.flickr.com/photos/"+owner+"/"+photo['id'];
		return url;
	};

	$.FlickrClient = FlickrClient;
})(jQuery);
