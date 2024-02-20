//AIzaSyAD7JowNHoI4KsaRB_eLKUMRsDhzNv5opw api key
//test url https://www.youtube.com/playlist?list=PL2uxd6YWj7PKk4LnkWZEyqpcvnXmv8Iuf

//this generates our video by taking the url the user passes, stripping it of just our useable url, and then generating an iframe.
document.getElementById("generatePlaylist").addEventListener("click", function () {
    var userInputtedURL = document.getElementById("videoURL").value

    var urlFormatting = (/https:\/\/www\.youtube\.com\/playlist\?list=/);

    var formattedURL = userInputtedURL.replace(urlFormatting, "")
    console.log(formattedURL)

    let arrayOfAllVideos = [];
    console.log(formattedURL)
    searchForPlaylist(formattedURL,arrayOfAllVideos);
    console.log(arrayOfAllVideos)
    putVideosInPlaylist(...arrayOfAllVideos);
});

 function searchForPlaylist(urlOfPlaylist,videoItems) {

    //this line is taking the "youtube.googleapis" api and fetiching all the formation in a playlist 
    //currently set to limit of 10 items, change &maxResults=10 to change this.
    //to change the url of the playlist retrieved, change the &playldistId= 's url.
    //last part is the API key, but you don't need to change that.

    let returnedANextPage = true;

    // var playlistItems = data.items;
    // returnedANextPage = data.nextPageToken;

    //this will hold the value of 1 video for our users, as an example.
    // `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${urlOfPlaylist}&key=AIzaSyAD7JowNHoI4KsaRB_eLKUMRsDhzNv5opw`

    let url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${urlOfPlaylist}&key=AIzaSyAD7JowNHoI4KsaRB_eLKUMRsDhzNv5opw`

    //initializing next page so it doesn't get flagged at start of recursion.
    let nextPage = 'h';


    function fetchNextPage() {
        //while there IS a next page to get information from...
        if (!nextPage) return;

        //our url we declared above will be changed as we recurse.
        fetch(url)
        .then(response => response.json())
        .then(data => {
            //json object that gives us our data back
            console.log(data);

            //nextPage is grabbed to get our token that tells us if we have a next page to go to
            nextPage = data.nextPageToken;

            //url gets updated with nextpage, should it have a next page
            url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&pageToken=${nextPage}&playlistId=${urlOfPlaylist}&key=AIzaSyAD7JowNHoI4KsaRB_eLKUMRsDhzNv5opw`;

            //we take all the data items we were given (should be ~50 per page unless page has >50 and we're about to stop recursing)
            for(i = 0; i < 50; i++) {
                //this is getting the unique id/url of the video at index i.
                let individualVideo = data.items[i].snippet.resourceId.videoId

                //sending them to our array up in the button eventListener
                videoItems.push(individualVideo);
            }
            // Call the function recursively for the next page, should it exist
            fetchNextPage();
        })

        //error handling
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    }
    
    //initial self-call
    fetchNextPage();

}

function putVideosInPlaylist(playlistItemsToShuffle) {
    
    //this is returning the snippet section of the api information

    const ORIGINAL_LENGTH = playlistItemsToShuffle.length;
    console.log(ORIGINAL_LENGTH)
    let videosThatHaveBeenShuffled = [];  

    for(i = 0; i < ORIGINAL_LENGTH; i++) {
        
        console.log(playlistItemsToShuffle)
        var currentRandomNumber = Math.floor(Math.random() * ORIGINAL_LENGTH);
        var randomVideoFromUnshuffledPlaylist = playlistItemsToShuffle[currentRandomNumber]
        videosThatHaveBeenShuffled.push(randomVideoFromUnshuffledPlaylist)
        playlistItemsToShuffle.splice(currentRandomNumber,1);
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

