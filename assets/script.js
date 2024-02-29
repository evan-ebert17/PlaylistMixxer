//AIzaSyAD7JowNHoI4KsaRB_eLKUMRsDhzNv5opw api key
//test url https://www.youtube.com/playlist?list=PL2uxd6YWj7PKk4LnkWZEyqpcvnXmv8Iuf

//creating a "Video" objects constructor:
function VideoDetails(videoId, videoTitle, thumbnailPictureUrl, videoUploader, isLastItem) {
    this.videoId = videoId;
    this.videoTitle = videoTitle;
    this.thumbnailPictureUrl = thumbnailPictureUrl;
    this.videoUploader = videoUploader;
    //this will be used to tell if our playlist is done playing
    this.isLastItem = isLastItem;
    if (isLastItem === undefined) {
        this.isLastItem = false;
    }
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
        .then(response => {
            if(response.status === 404) {
                alert("The playlist does not exist OR is private, try another.");
                return;
            } else if (response.status === 400){
                alert("Please enter a playlist URL.");
                return;
            }
            else {
                return response.json()
            }
        }
            )
        .then(data => {
            console.log(data)
            if(data === undefined) {
                return;
            }
            
            let loader = document.getElementById("loader");

            loader.style.visibility = 'visible';
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
                let individualVideoUploader = data.items[i].snippet.videoOwnerChannelTitle;

                //the thumbnails url is just the video url with this formatting
                let individualVideoThumbnailUrl = `https://i.ytimg.com/vi/${individualVideo}/default.jpg`

                //creating the VideoDetails object which holds the necissary information for creating the playlist later.
                const completeVideoObject = new VideoDetails(individualVideo, individualVideoTitle, individualVideoThumbnailUrl, individualVideoUploader)
                //sending them to our array to be shuffled
                arrayOfAllVideos.push(completeVideoObject);
            }

            //if we dont find that the playlist requested has another page, no worries for the complicated pagination!
            if (nextPageToken === undefined) {
                loader.style.visibility = 'hidden';
                //after we're done putting those videos into our array, we can call our shuffling algo.
                playlistTypeSelector(arrayOfAllVideos);
            } else {

                putVideosInPlaylist(formattedPlaylistID, nextPageToken, arrayOfAllVideos)
                    .then(finalResult => {
                        loader.style.visibility = 'hidden';
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

    //adding our video that flags "we're done!"" (isLastItem = true) to end of array.
    //this is so we can create a conditional loop later for "while... != true"
    let lastItemInPlaylist = new VideoDetails(
        //videoId
        videosThatHaveBeenShuffled[videosThatHaveBeenShuffled.length - 1].videoId,
        //videoTitle
        videosThatHaveBeenShuffled[videosThatHaveBeenShuffled.length - 1].videoTitle,
        //thumbnailUrl
        videosThatHaveBeenShuffled[videosThatHaveBeenShuffled.length - 1].thumbnailPictureUrl,
        //videoUploader
        videosThatHaveBeenShuffled[videosThatHaveBeenShuffled.length - 1].videoUploader,
        //isLastItem
        true
    )


    //removing last element
    videosThatHaveBeenShuffled.splice(videosThatHaveBeenShuffled.length - 1, 1)

    //replacing last element with our isLastItem flagged video.
    videosThatHaveBeenShuffled.push(lastItemInPlaylist)

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
        //trueRandomShuffle(arrayOfAllVideos)
    })

    smartRandomShuffleButton.addEventListener('click', () => {
        //eventually change to smartRandomShuffle()
        //trueRandomShuffle(arrayOfAllVideos)
    })

}

function playlistCreation(playlistWithAllVideoDetails) {

    //emptying out the buttons on screen for Div formatting
    let choiceButtonsDiv = document.getElementById('choiceButtonsDiv');
    choiceButtonsDiv.innerHTML = ''

    //creating a green border to the left of where the videos will be played
    // choiceButtonsDiv.style.borderLeft = '2px solid #29BF12'
    let centeredDiv = document.getElementById('centeredDiv');

    //we're going to take our main card and remove the flex-direction tag, condensing everything
    //to one side of the card, and make the other side of the card where we house our videos.
    centeredDiv.style.flexDirection = 'initial'
    centeredDiv.style.width = '95%'
    let inputHolderDiv = document.getElementById('inputHolder');

    //centering our newly moved input fields
    inputHolderDiv.style.display = 'flex';
    inputHolderDiv.style.flexDirection = 'column';
    inputHolderDiv.style.alignItems = 'center';

    choiceButtonsDiv.innerHTML = '';
    const part1OfPlaylistInnerHTMLConstruction = `                    <div id="playlist">`
    //
    const playlistDiv = document.getElementById("playlist");
    let result = "";
    for (let i = 0; i < playlistWithAllVideoDetails.length; i++) {


        let currentPlaylistItem = `<div class="playlistItem" id="playlistItem${i}">
        <div id="thumbnailContainer">
            <img class="img-thumbnail" src="${playlistWithAllVideoDetails[i].thumbnailPictureUrl}" alt="Thumbnail">
        </div>
        <div id="titleAuthorContainer">
            <div id="titleContainer">

            <span class="titleInfo">${playlistWithAllVideoDetails[i].videoTitle}</span>

            </div>
            <div id="authorContainer">

            <span class="authorInfo">${playlistWithAllVideoDetails[i].videoUploader}</span>

            </div>
        </div>

    </div>`

        result = result + currentPlaylistItem;
    }

    let currentVideoPlaying =
        `<div id = "videoPlayer">
                    <iframe id="videoElement" width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/${playlistWithAllVideoDetails[0].videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                    </div >`

    choiceButtonsDiv.innerHTML = part1OfPlaylistInnerHTMLConstruction + result + `</div>` + currentVideoPlaying;

    for (let i = 0; i < playlistWithAllVideoDetails.length; i++) {

        let currentVideoId = playlistWithAllVideoDetails[i].videoId
        document.getElementById(`playlistItem${i}`).addEventListener('click', function () {

            document.getElementById("videoElement").setAttribute('src', `https://www.youtube-nocookie.com/embed/${currentVideoId}`)

        })
    }

    let textHolderDiv = document.getElementById("textHolder")
    textHolderDiv.innerHTML = ''


    // This comment block represents the inputbar + button to generate a new playlist & subsequent buttons

    // <div class="input-group mb-3">
    //                                 <input type="text" id="videoURL" class="form-control" placeholder="Enter URL here"
    //                                     aria-label="Enter URL here" aria-describedby="basic-addon2">
    //                                 <div class="input-group-append">
    //                                     <button id="generatePlaylist" class="btn btn-dark"
    //                                         type="button">Generate Playlist</button>
                                            
    //                                 </div>
    //                                 <div id="loader" class="lds-ellipsis">
    //                                     <div></div>
    //                                     <div></div>
    //                                     <div></div>
    //                                     <div></div>
    //                                 </div>
    //                             </div>
}

//this might be relevant in the youtube embed styling
// class="style-scope ytd-watch-flexy" 