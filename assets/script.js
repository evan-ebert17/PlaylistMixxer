//AIzaSyAD7JowNHoI4KsaRB_eLKUMRsDhzNv5opw api key
//test url https://www.youtube.com/playlist?list=PL2uxd6YWj7PKk4LnkWZEyqpcvnXmv8Iuf

//this generates our video by taking the url the user passes, stripping it of just our useable url, and then generating an iframe.
document.getElementById("generatePlaylist").addEventListener("click", function () {
    var userInputtedURL = document.getElementById("videoURL").value

    var urlFormatting = (/https:\/\/www\.youtube\.com\/playlist\?list=/);

    var formattedPlaylistID = userInputtedURL.replace(urlFormatting, "")

    let arrayOfAllVideos = [];

    //FOR FUTURE ME:
    //THIS CODE IS WORKING AS HALF INTENDED!
    //searchForPlaylist's API CALL IS TOO SLOW AND WE NEED TO MAKE AN ASYNC AWAIT CALL
    //BEFORE WE PASS THE ARRAY IT GIVES US TO putVideosInPlaylist

    //this line is taking the "youtube.googleapis" api and fetiching all the formation in a playlist 
    //currently set to limit of 10 items, change &maxResults=10 to change this.
    //to change the url of the playlist retrieved, change the &playldistId= 's url.
    //last part is the API key, but you don't need to change that.

    let url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${formattedPlaylistID}&key=AIzaSyAD7JowNHoI4KsaRB_eLKUMRsDhzNv5opw`

    //we fetch the url
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data)

            var nextPageToken = data.nextPageToken;

            //if we dont find that the playlist requested has another page, no worries for the complicated pagination!
            if (nextPageToken == undefined) {

                //naming variables for readability
                var totalAmountOfVideosInPlaylist = data.pageInfo.totalResults;

                //loop through the results and strip the video ids, stick them in "arrayOfAllVideos"
                for (i = 0; i < totalAmountOfVideosInPlaylist; i++) {
                    //this is getting the unique id/url of the video at index i.
                    let individualVideo = data.items[i].snippet.resourceId.videoId

                    //sending them to our array to be shuffled
                    arrayOfAllVideos.push(individualVideo);
                }

                //after we're done putting those videos into our array, we can call our shuffling algo.
                putVideosInPlaylist(arrayOfAllVideos);
            } else {
                searchForPlaylist(formattedPlaylistID, nextPageToken ,arrayOfAllVideos);
            }
        })

    //console.log(arrayOfAllVideos)
    //putVideosInPlaylist(arrayOfAllVideos);
});

async function searchForPlaylist(playlistID, nextPageToken, videoItems) {

    //this line is taking the "youtube.googleapis" api and fetiching all the formation in a playlist 
    //currently set to limit of 10 items, change &maxResults=10 to change this.
    //to change the url of the playlist retrieved, change the &playldistId= 's url.
    //last part is the API key, but you don't need to change that.

    //this will hold the value of 1 video for our users, as an example.
    // `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${urlOfPlaylist}&key=AIzaSyAD7JowNHoI4KsaRB_eLKUMRsDhzNv5opw`


    url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&pageToken=${nextPageToken}&playlistId=${playlistID}&key=AIzaSyAD7JowNHoI4KsaRB_eLKUMRsDhzNv5opw`;

    //initializing next page so it doesn't get flagged at start of recursion.

    //while there IS a next page to get information from...
    fetch(url)
        .then(response => response.json())
        .then(data => {
            //json object that gives us our data back
            console.log(data);



            //if there is only one pages worth of items in a playlist
            if (!(hasNextPage)) {
                for (i = 0; i < totalAmountOfVideosInPlaylist; i++) {
                    //this is getting the unique id/url of the video at index i.
                    let individualVideo = data.items[i].snippet.resourceId.videoId

                    //sending them to our array up in the button eventListener
                    videoItems.push(individualVideo);
                }
            }

            while (hasNextPage) {

                if (totalAmountOfVideosInPlaylist > MAX_RESULTS_PER_PAGE) totalAmountOfVideosInPlaylist = MAX_RESULTS_PER_PAGE;

                for (i = 0; i < totalAmountOfVideosInPlaylist; i++) {
                    //this is getting the unique id/url of the video at index i.
                    let individualVideo = data.items[i].snippet.resourceId.videoId

                    //sending them to our array up in the button eventListener
                    videoItems.push(individualVideo);
                }


            }
        })

        //error handling
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function putVideosInPlaylist(playlistItemsToShuffle) {

    //this is returning the snippet section of the api information
    let videosThatHaveBeenShuffled = []

    //THIS IS TRUE RANDOM SHUFFLE!
    while (playlistItemsToShuffle.length != 0) {

        var currentRandomNumber = Math.floor(Math.random() * playlistItemsToShuffle.length);
        var randomVideoFromUnshuffledPlaylist = playlistItemsToShuffle[currentRandomNumber]
        videosThatHaveBeenShuffled.push(randomVideoFromUnshuffledPlaylist)
        playlistItemsToShuffle.splice(currentRandomNumber, 1);
        console.log(playlistItemsToShuffle)
        console.log(videosThatHaveBeenShuffled)

    }






    // let videosToNotBePlayedForRestOfShuffle = [];

    // while (videosToNotBePlayedForRestOfShuffle.length !== ORIGINAL_LENGTH) {
    //     const iframeVideoLocation = `<iframe id="videoCurrentlyPlaying" width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/${singleVideoInformation}" frameborder="0" allow="encrypted-media" allowfullscreen=""></iframe>`
    //     var videoLocation = document.getElementById("videoLocation");
    //     videoLocation.innerHTML = iframeVideoLocation;
    // }


}

function playlistTypeSelector() {
    //this function returns the choice a user made in their preferred shuffle method and generates the card to make that choice.
    var mcvhInsertingChoiceCard = document.getElementById('middleContentVideoHolder')
    var floatingChoiceDiv = document.createElement('div');
    floatingChoiceDiv.setAttribute('id', 'floatingChoiceDiv');

    //this card creates 3 buttons that will determine the "3" choices the user can make.
    floatingChoiceDiv.innerHTML = `
    
    
    <div id="floatingChoiceMenu">
                    <button id="trueRandom" class="shuffleChoice">true-random shuffle</button>
                    <button id="rangeRandom" class="shuffleChoice">num shuffle</button>
                    <button id="smartRandom" class="shuffleChoice">smart shuffle</button>
                </div>
    
    `
    mcvhInsertingChoiceCard.appendChild(floatingChoiceDiv);

    //this commented out stuff is a potential dim feature on the button card generation

    // var cardLocation = document.getElementById("floatingChoiceMenu");
    // var dimWebpage = document.getElementById("overlay");
    // dimWebpage.style.display = "block"

    var trueRandomButton = document.getElementById("trueRandom")

}

