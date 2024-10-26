//test url https://www.youtube.com/playlist?list=PL2uxd6YWj7PKk4LnkWZEyqpcvnXmv8Iuf

//require('dotenv').config();

//creating a "Video" objects constructor:
function VideoDetails(videoId, videoTitle, thumbnailPictureUrl, videoUploader, itemIndex, isLastItem) {
    this.videoId = videoId;
    this.videoTitle = videoTitle;
    this.thumbnailPictureUrl = thumbnailPictureUrl;
    this.videoUploader = videoUploader;
    if (videoUploader === undefined) {
        this.videoUploader = '';
    }
    this.itemIndex = itemIndex;
    //this will be used to tell if our playlist is done playing
    this.isLastItem = isLastItem;
    if (isLastItem === undefined) {
        this.isLastItem = false;
    }
}

//this generates our video by taking the url the user passes, stripping it of just our useable url, and then generating an iframe.
document.getElementById("generatePlaylist").addEventListener("click", function () {
    let userInputtedURL = document.getElementById("videoURL").value

    let urlFormatting = /^https?:\/\/(?:www\.)?youtube\.com\/playlist\?list=/

    let formattedPlaylistID = userInputtedURL.replace(urlFormatting, "")

    let loader = document.getElementById("loader");

    loader.style.visibility = 'visible';

    //this line is taking the "youtube.googleapis" api and fetiching all the formation in a playlist 
    //currently set to limit of 10 items, change &maxResults=10 to change this.
    //to change the url of the playlist retrieved, change the &playldistId= 's url.
    //last part is the API key, but you don't need to change that.

    const apiUrl = `https://ikrh3hyhzc.execute-api.us-east-2.amazonaws.com/getAPIKEY?playlistId=${formattedPlaylistID}`;
    //?pageToken=${next_pageToken}

    //we fetch the url
    fetch(apiUrl)
        .then(response => {
            if (response.status === 404) {
                alert("The playlist does not exist OR is private, try another.");
                loader.style.visibility = 'hidden';
                return;
            } else if (response.status === 400) {
                alert("Please enter a playlist URL.");
                loader.style.visibility = 'hidden';
                return;
            }
            else {
                return response.json()
            }
        }
        )
        .then(data => {
            console.log(data)
            if (data === undefined) {
                loader.style.visibility = 'hidden';
                return;
            }
            let nextPageToken = data.nextPageToken;
            let arrayOfAllVideos = [];

            //naming variables for readability

            let itemsThisPage = data.items.length
            //I think there may be an edge case where if a playlist is exactly 50 elements long, we're going to lose the last, or 50th element

            //loop through the results and strip the video ids, stick them in "arrayOfAllVideos"
            for (i = 0; i < itemsThisPage; i++) {
                //this is getting the unique id/url of the video at index i.
                let individualVideo = data.items[i].snippet.resourceId.videoId;
                let individualVideoTitle = data.items[i].snippet.title;
                let individualVideoUploader = data.items[i].snippet.videoOwnerChannelTitle;
                let currentItemIndex = i + 1

                //the thumbnails url is just the video url with this formatting
                let individualVideoThumbnailUrl = `https://i.ytimg.com/vi/${individualVideo}/default.jpg`

                //creating the VideoDetails object which holds the necissary information for creating the playlist later.
                const completeVideoObject = new VideoDetails(individualVideo, individualVideoTitle, individualVideoThumbnailUrl, individualVideoUploader, currentItemIndex)
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
        })

});

function putVideosInPlaylist(playlistID, next_pageToken, videoItems) {

    //this line is taking the "youtube.googleapis" api and fetiching all the formation in a playlist 
    //currently set to limit of 10 items, change &maxResults=10 to change this.
    //to change the url of the playlist retrieved, change the &playldistId= 's url.
    //last part is the API key, but you don't need to change that.

    //this function recursively returns promises and resolves them at the end of each recursion
    return new Promise((resolve, reject) => {

        //our url we will be checking to see if hasNextPage (next_pageToken)
        let apiUrl = `https://ikrh3hyhzc.execute-api.us-east-2.amazonaws.com/getAPIKEYPagination?pageToken=${next_pageToken}&playlistId=${playlistID}`;

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
                    let individualVideoUploader = data.items[i].snippet.videoOwnerChannelTitle
                    //the thumbnails url is just the video url with this formatting
                    let individualVideoThumbnailUrl = `https://i.ytimg.com/vi/${individualVideo}/default.jpg`
                    let currentItemIndex = i + 51;
                    const completeVideoObject = new VideoDetails(individualVideo, individualVideoTitle, individualVideoThumbnailUrl, individualVideoUploader, currentItemIndex)
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

        let currentRandomNumber = Math.floor(Math.random() * playlistItemsToShuffle.length);
        let randomVideoFromUnshuffledPlaylist = playlistItemsToShuffle[currentRandomNumber]
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

function rangeShuffle(playlistItemsToShuffle, rangeStart, rangeEnd) {
    let videosThatHaveBeenShuffled = []

    let rangeOfVideos = [];

    for (let i = rangeStart - 1; i < rangeEnd; i++) {
        rangeOfVideos.push(playlistItemsToShuffle[i])
    }

    while (rangeOfVideos.length != 0) {

        let currentRandomNumber = Math.floor(Math.random() * rangeOfVideos.length);

        let randomVideoFromUnshuffledPlaylist = rangeOfVideos[currentRandomNumber]
        console.log(randomVideoFromUnshuffledPlaylist)
        videosThatHaveBeenShuffled.push(randomVideoFromUnshuffledPlaylist)
        console.log(videosThatHaveBeenShuffled)
        rangeOfVideos.splice(currentRandomNumber, 1);

    }

    playlistCreation(videosThatHaveBeenShuffled)
}

function playlistTypeSelector(arrayOfAllVideos) {
    //this function returns the choice a user made in their preferred shuffle method and generates the card to make that choice.
    let choiceButtonsDiv = document.getElementById('choiceButtonsDiv')

    //this card creates 3 buttons that will determine the "3" choices the user can make.
    choiceButtonsDiv.innerHTML = `
                    <div>
                    
                    <button id="trueRandom" class="btn btn-dark shuffleChoice">True Random Shuffle</button>
                    <p class="shuffleChoiceText">This shuffle shuffles the whole playlist <i>entirely</i> randomly.</p>
                    </div>
                    <div>
                    
                    <button id="rangeRandom" type="button" class="btn btn-dark shuffleChoice">Range Random Shuffle</button>
                    <p class="shuffleChoiceText" >This shuffle takes in a start and an end and shuffles the playlist between that range.</p>
                    </div>
    `
    // <button id="smartRandom" class="shuffleChoice">smart shuffle</button> add this later.

    let trueRandomShuffleButton = document.getElementById("trueRandom")
    let rangeRandomShuffleButton = document.getElementById("rangeRandom")

    // var smartRandomShuffleButton = document.getElementById("trueRandom")

    trueRandomShuffleButton.addEventListener('click', () => {
        trueRandomShuffle(arrayOfAllVideos)
    })

    rangeRandomShuffleButton.addEventListener('click', () => {

        //this is just an alert with input validation asking you to select a start and stop range.
        let userInputtedRangeStart = prompt("Please specify the start of the range: ", `1 - ${arrayOfAllVideos.length}`)
        while (userInputtedRangeStart === '' || userInputtedRangeStart > arrayOfAllVideos.length || userInputtedRangeStart == 0) {
            alert("Please provide a range IN range.")
            userInputtedRangeStart = prompt("Please provide a range: ", `1 - ${arrayOfAllVideos.length}`)
        }

        let userInputtedRangeEnd = prompt("Please specify the end of the range: ", `${userInputtedRangeStart} - ${arrayOfAllVideos.length}`)

        while (userInputtedRangeEnd === "" || userInputtedRangeEnd > arrayOfAllVideos.length || userInputtedRangeStart > userInputtedRangeEnd) {
            alert("Please provide a range IN range.")
            userInputtedRangeEnd = prompt("Please provide a range: ", `${userInputtedRangeStart} - ${arrayOfAllVideos.length}`)
        }

        rangeShuffle(arrayOfAllVideos, parseInt(userInputtedRangeStart), parseInt(userInputtedRangeEnd))
    })

    // smartRandomShuffleButton.addEventListener('click', () => {
    //     //eventually change to smartRandomShuffle()
    //     //trueRandomShuffle(arrayOfAllVideos)
    // })

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

    choiceButtonsDiv.style.alignItems = 'normal'
    choiceButtonsDiv.innerHTML = '';
    const part1OfPlaylistInnerHTMLConstruction = `                    <div id="playlist">`
    //
    const playlistDiv = document.getElementById("playlist");
    let result = "";
    for (let i = 0; i < playlistWithAllVideoDetails.length; i++) {

        let currentPlaylistItem = `<div class="playlistItem" id="playlistItem${i}">
        <div id="thumbnailContainer">
            <img class="imageSizing" src="${playlistWithAllVideoDetails[i].thumbnailPictureUrl}" alt="Thumbnail">
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
    //---------------------------------------------
    let currentVideoPlaying =
        `<div id = "videoPlayer">
        <iframe id="videoElement" width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/${playlistWithAllVideoDetails[0].videoId}?autoplay=1&enablejsapi=1&origin=https://evan-ebert17.github.io/PlaylistShuffler/" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                    </div >`

    let tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // 3. This function creates an <iframe> (and YouTube player)
    //    after the API code downloads.
    let player;
    function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange

            }
        });
    }
    // 4. The API will call this function when the video player is ready.
    function onPlayerReady(event) {
        console.log(event)
        event.target.playVideo();
    }

    function onPlayerStateChange() {

    }


    //---------------------------------------------
    choiceButtonsDiv.innerHTML = part1OfPlaylistInnerHTMLConstruction + result + `</div>` + currentVideoPlaying;


    //setting the "currentVideo" to the first element of our array, as that will always be the case
    document.getElementById(`playlistItem${0}`).setAttribute('class', 'currentVideo playlistItem');

    let currentHighlightedVideo = [document.getElementById(`playlistItem${0}`)];

    for (let i = 0; i < playlistWithAllVideoDetails.length; i++) {

        let currentVideoId = playlistWithAllVideoDetails[i].videoId
        document.getElementById(`playlistItem${i}`).addEventListener('click', function () {

            document.getElementById("videoElement").setAttribute('src', `https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1&enablejsapi=1&origin=https://evan-ebert17.github.io/PlaylistShuffler/`)
            document.getElementById(`playlistItem${i}`).setAttribute('class', 'currentVideo playlistItem')

            //This is taking our current video and putting into currentHighlightedVideo
            //Then we take whatever was previously in there (to start with it is the first element of the array) and remove the 'currentVideo' class from it
            //then we remove that element from the currentHighlightedVideo array altogether.

            currentHighlightedVideo.push(document.getElementById(`playlistItem${i}`))
            currentHighlightedVideo[0].setAttribute('class', 'playlistItem');
            currentHighlightedVideo.splice(0, 1);
        })
    }

    let textHolderDiv = document.getElementById("textHolder")
    textHolderDiv.style.display = 'none';


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