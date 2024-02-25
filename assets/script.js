//AIzaSyAD7JowNHoI4KsaRB_eLKUMRsDhzNv5opw api key
//test url https://www.youtube.com/playlist?list=PL2uxd6YWj7PKk4LnkWZEyqpcvnXmv8Iuf

//creating a "Video" objects constructor:
function VideoDetails(videoID, videoTitle, thumbnailPictureUrl) {
    this.videoID = videoID;
    this.videoTitle = videoTitle;
    this.thumbnailPictureUrl = thumbnailPictureUrl;
}

//this generates our video by taking the url the user passes, stripping it of just our useable url, and then generating an iframe.
document.getElementById("generatePlaylist").addEventListener("click", function () {
    var userInputtedURL = document.getElementById("videoURL").value

    var urlFormatting = /^https?:\/\/(?:www\.)?youtube\.com\/playlist\?list=/

    var formattedPlaylistID = userInputtedURL.replace(urlFormatting, "")

    //FOR FUTURE ME:
    //THIS CODE IS WORKING AS HALF INTENDED!
    //searchForPlaylist's API CALL IS TOO SLOW AND WE NEED TO MAKE AN ASYNC AWAIT CALL
    //BEFORE WE PASS THE ARRAY IT GIVES US TO putVideosInPlaylist

    //this line is taking the "youtube.googleapis" api and fetiching all the formation in a playlist 
    //currently set to limit of 10 items, change &maxResults=10 to change this.
    //to change the url of the playlist retrieved, change the &playldistId= 's url.
    //last part is the API key, but you don't need to change that.

    let apiUrl = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${formattedPlaylistID}&key=AIzaSyAD7JowNHoI4KsaRB_eLKUMRsDhzNv5opw`

    //we fetch the url
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {

            console.log(data)
            let loader = document.getElementById("loader");

            loader.style.display = 'inline-block';
            var nextPageToken = data.nextPageToken;
            let arrayOfAllVideos = [];

            //naming variables for readability

            var itemsThisPage = data.items.length
            //I think there may be an edge case where if a playlist is exactly 50 elements long, we're going to lose the last, or 50th element

            //loop through the results and strip the video ids, stick them in "arrayOfAllVideos"
            for (i = 0; i < itemsThisPage; i++) {
                //this is getting the unique id/url of the video at index i.
                let individualVideo = data.items[i].snippet.resourceId.videoId;
                let individualVideoTitle = data.items[i].snippet.title;

                //the thumbnails url is just the video url with this formatting
                let individualVideoThumbnailUrl = `https://i.ytimg.com/vi/${individualVideo}/default.jpg`

                //creating the VideoDetails object which holds the necissary information for creating the playlist later.
                const completeVideoObject = new VideoDetails(individualVideo, individualVideoTitle, individualVideoThumbnailUrl)
                //sending them to our array to be shuffled
                arrayOfAllVideos.push(completeVideoObject);
            }

            //if we dont find that the playlist requested has another page, no worries for the complicated pagination!
            if (nextPageToken === undefined) {
                loader.style.display = 'none';
                //after we're done putting those videos into our array, we can call our shuffling algo.
                playlistTypeSelector(arrayOfAllVideos);
            } else {

                putVideosInPlaylist(formattedPlaylistID, nextPageToken, arrayOfAllVideos)
                    .then(finalResult => {
                        loader.style.display = 'none';
                        playlistTypeSelector(finalResult);
                    }
                    )

            }

        }
        )




})

function putVideosInPlaylist(playlistID, next_pageToken, videoItems) {

    //this line is taking the "youtube.googleapis" api and fetiching all the formation in a playlist 
    //currently set to limit of 10 items, change &maxResults=10 to change this.
    //to change the url of the playlist retrieved, change the &playldistId= 's url.
    //last part is the API key, but you don't need to change that.

    //this will hold the value of 1 video for our users, as an example.
    // `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${urlOfPlaylist}&key=AIzaSyAD7JowNHoI4KsaRB_eLKUMRsDhzNv5opw`

    //this function recursively returns promises and resolves them at the end of each recursion
    return new Promise((resolve, reject) => {

        //our url we will be checking to see if hasNextPage (next_pageToken)
        let apiUrl = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&pageToken=${next_pageToken}&playlistId=${playlistID}&key=AIzaSyAD7JowNHoI4KsaRB_eLKUMRsDhzNv5opw`;

        //while there IS a next page to get information from...
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                //json object that gives us our data back
                console.log(data);

                //this gives us the amount of things on X page, if it's less than 50 we're done looping and need to accomodate the < 50 so we dont get undefined or OOB index errors
                let itemsThisPage = data.items.length
                console.log(itemsThisPage)

                for (let i = 0; i < itemsThisPage; i++) {
                    //this is getting the unique id/url of the video at index i.
                    let individualVideo = data.items[i].snippet.resourceId.videoId;
                    let individualVideoTitle = data.items[i].snippet.title;
                    //the thumbnails url is just the video url with this formatting
                    let individualVideoThumbnailUrl = `https://i.ytimg.com/vi/${individualVideo}/default.jpg`

                    const completeVideoObject = new VideoDetails(individualVideo, individualVideoTitle, individualVideoThumbnailUrl)
                    //sending them to our array up in the button eventListener

                    videoItems.push(completeVideoObject);
                }

                //if this exists, we don't return undefined
                let next_pageToken = data.nextPageToken;

                //if the previous line didn't return undefined
                if (next_pageToken !== undefined) {
                    //resolve the last step of our recursion
                    resolve(putVideosInPlaylist(playlistID, next_pageToken, videoItems))
                } else {
                    resolve(videoItems)
                }

                //error handling
            })
            .catch(error => {
                reject(error);
            });
    })


};

function trueRandomShuffle(playlistItemsToShuffle) {

    //this is returning the snippet section of the api information
    let videosThatHaveBeenShuffled = []

    //THIS IS TRUE RANDOM SHUFFLE!
    while (playlistItemsToShuffle.length != 0) {

        var currentRandomNumber = Math.floor(Math.random() * playlistItemsToShuffle.length);
        var randomVideoFromUnshuffledPlaylist = playlistItemsToShuffle[currentRandomNumber]
        videosThatHaveBeenShuffled.push(randomVideoFromUnshuffledPlaylist)
        playlistItemsToShuffle.splice(currentRandomNumber, 1);

    }

    // let videosToNotBePlayedForRestOfShuffle = [];

    // while (videosToNotBePlayedForRestOfShuffle.length !== ORIGINAL_LENGTH) {
    //     const iframeVideoLocation = `<iframe id="videoCurrentlyPlaying" width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/${singleVideoInformation}" frameborder="0" allow="encrypted-media" allowfullscreen=""></iframe>`
    //     var videoLocation = document.getElementById("videoLocation");
    //     videoLocation.innerHTML = iframeVideoLocation;
    // }

    playlistCreation(videosThatHaveBeenShuffled)

}

function playlistTypeSelector(arrayOfAllVideos) {
    //this function returns the choice a user made in their preferred shuffle method and generates the card to make that choice.
    var choiceButtonsDiv = document.getElementById('choiceButtonsDiv')

    //this card creates 3 buttons that will determine the "3" choices the user can make.
    choiceButtonsDiv.innerHTML = `
    
                    <button id="trueRandom" class="shuffleChoice">true-random shuffle</button>
                    <button id="rangeRandom" class="shuffleChoice">num shuffle</button>
                    <button id="smartRandom" class="shuffleChoice">smart shuffle</button>
    
    `
    //this commented out stuff is a potential dim feature on the button card generation

    // var cardLocation = document.getElementById("floatingChoiceMenu");
    // var dimWebpage = document.getElementById("overlay");
    // dimWebpage.style.display = "block"

    var trueRandomShuffleButton = document.getElementById("trueRandom")
    var rangeRandomShuffleButton = document.getElementById("trueRandom")
    var smartRandomShuffleButton = document.getElementById("trueRandom")

    trueRandomShuffleButton.addEventListener('click', () => {
        trueRandomShuffle(arrayOfAllVideos)
    })

    rangeRandomShuffleButton.addEventListener('click', () => {
        //eventually change to rangeRandomShuffle()
        trueRandomShuffle(arrayOfAllVideos)
    })

    smartRandomShuffleButton.addEventListener('click', () => {
        //eventually change to smartRandomShuffle()
        trueRandomShuffle(arrayOfAllVideos)
    })

}

function playlistCreation(playlistWithAllVideoDetails) {
    //we're going to take our main card and remove the flex-direction tag, condensing everything
    //to one side of the card, and make the other side of the card where we house our videos.
    
    //emptying out the buttons on screen for Div formatting
    document.getElementById('choiceButtonsDiv').innerHTML = ''
    let centeredDiv = document.getElementById('centeredDiv');
    centeredDiv.style.flexDirection = 'initial'
    let inputHolderDiv = document.getElementById('inputHolder');
    inputHolderDiv.style.display = 'flex';
    inputHolderDiv.style.flexDirection = 'column';
    inputHolderDiv.style.alignItems = 'center'



    console.log(playlistWithAllVideoDetails)
}