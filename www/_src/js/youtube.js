!function ( $, win ) {
	"use strict";

	win.YOUTUMBLR = win.YOUTUMBLR || {};
	win.YOUTUMBLR.youtube = win.YOUTUMBLR.youtube || {};

	var oYoutube = win.YOUTUMBLR.youtube;

	/**
	* Percentage of videos added.
	* @type {Number}
	*/
	var percentage_add_videos = 0,

	/**
	* Total of videos found on Tumblr.
	* @type {Number}
	*/
	counter_videos_found = 0,

	/**
	* Videos added to Youtube
	* @type {Number}
	*/
	counter_add_videos = 0,

	/**
	* Object containg data of the playlist created.
	* @type {Object}
	*/
	playlist_data = {},

	/**
	* Array w/ videos found/to-insert.
	* @type {}
	*/
	video_posts;

	/* helper */
	function getToday() {

		var today = new Date(),
				dd = today.getDate(),
				mm = today.getMonth()+1, //January is 0!
				yyyy = today.getFullYear();

		if( dd < 10 ) dd='0'+dd;
		if (mm < 10) mm='0'+mm;

		return dd+'/'+mm+'/'+yyyy;

	}

	// Topic Subscriptions
	oYoutube.subscribeToTopics = function() {

		var self = this;

		$.Topic( "finishGetTumblrPosts" ).subscribe( function ( posts ) {
			counter_videos_found = posts.length;
			video_posts = posts;
			self.setEvents();
		});

	};

	// Events
	oYoutube.setEvents = function () {

		var self = this;

		$("#migrate_youtube").bind ("click", function() {
			$(this).attr("disabled","disabled");
			self.promiseCreatePlaylist()
				.then( self.afterPlaylistCreated )
				.each( self.promiseAddToPlaylist )
				.then( updateUIprocessCompleted );
		});

	};

	/**
	* Promise that calls the YouTube API to create a Playlist and returns another Promise (chaining) when is done.
	*/
	oYoutube.promiseCreatePlaylist = function () {

		var tumblr_site = $("#tumblr_site input").val(),
				playlist_description = PLAYLIST_DESCRIPTION + tumblr_site;

		playlist_description += "\n " + PLAYLIST_CREATION + getToday() + " from " + document.URL;

		return new Promise( function(resolve) {
			gapi.client.youtube.playlists.insert({
				part: 'snippet,status',
				resource: {
					snippet: {
						title: "@"+tumblr_site,
						description: playlist_description
					},
					status: {
						privacyStatus: 'private'
					}
				}
			}).execute( resolve ); // resolve (response) --> complete the promise
		});

	};

	/**
	* Update UI after playlist creation and returns list of videos to be inserted in the playlist.
	* @param {Objects} response API response
	*/
	oYoutube.afterPlaylistCreated = function(response){

		var result = response.result;

		if (result) {

		playlist_data = {
		id:  result.id,
		title: result.snippet.title,
		description: result.snippet.description,

		};

		updateDomPlaylistData_Step3 (playlist_data);

		}

		return video_posts; // return array of videos to be treated w/ each

	};

	/**
	* Returns a Promise (chaining) that creates a new playlist in youTube (through its API) and solve it (the promise) once is created
	* @param {Object} video Video custom data
	* @returns {Object} Pronise
	*/
	oYoutube.promiseAddToPlaylist = function( video ){

		var playlist_id = playlist_data.id,
				details = {
					videoId: video.video_id,
					kind: 'youtube#video'
				};

		return new Promise( function(resolve) {
			gapi.client.youtube.playlistItems.insert({
				part: 'snippet',
				resource: {
					snippet: {
						playlistId:  playlist_id,
						resourceId: details
					}
				}
			}).execute( function (response) {
				counter_add_videos++;
				percentage_add_videos = (counter_add_videos/counter_videos_found)*100;

				updateUIafterVideoInserted(response, video, counter_add_videos, percentage_add_videos);

				resolve(response);
			});
		});

	};

	/**
	* Update some UI elements to show which videos have been added
	* @param {Object} response Response from the YouTube API after the adition of the video
	* @param {Object} video Video custom data
	* @param {Number} counter_add_videos Total of added videos
	* @param {Number} percentage_add_videos Percentage of videos added from the total
	*/
	function updateUIafterVideoInserted ( response, video, counter_add_videos, percentage_add_videos ) {

		var videoTitle = response.result.snippet.title,
			videoId = response.result.snippet.resourceId.videoId,
			videoUrl = video.url;

		$('#adding_videos strong').html(parseInt(percentage_add_videos,10)+"%");

		$('#adding_videos span').html(
			function(item, content) {
				return content+".";
			}
		);

		$('#videos_addition_completed strong:nth-child(1)').html(counter_add_videos);

		$("#videos_addition_completed ol")
			.append(
				$("<li>")
					.html( video.embed_code )
					.append( $("<p>").html(video.slug) )
				);

		optimizeYouTubeEmbeds();

	}

	/**
	* Updates UI to show the process have been completed
	*/
	function updateUIprocessCompleted () {

		var updateLinkContent = function(i, content) {
			return content+playlist_data.id;
		};

		$("#process_completed").removeClass("hidden");
		$("#process_completed a").attr("href", updateLinkContent );

	}

	/**
	* Update UI to show data of the recently created playlist
	* @param {Object} data Playlist info
	*/
	function updateDomPlaylistData_Step3 (data) {

		$('#playlist-id').html(data.id);

		$('#playlist-title').html(data.title);
		$('#playlist_creation strong').html(data.title);

		$('#playlist-description').html(data.description);

		$('#playlist_creation').removeClass("hidden");
		$('#playlist-button').attr("disabled", "disabled");

		$('#adding_videos em:nth-child(1)').html(counter_videos_found);
		$('#adding_videos em:nth-child(2)').html(data.title);
		$('#adding_videos em:nth-child(3)').html(percentage_add_videos+"%");

		$('#adding_videos').removeClass("hidden");
		$('#videos_addition_completed').removeClass("hidden");
		$('#videos_addition_completed strong:nth-child(2)').html(data.title);

	}

}( jQuery, window );