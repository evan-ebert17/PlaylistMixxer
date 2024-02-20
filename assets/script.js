//AIzaSyAD7JowNHoI4KsaRB_eLKUMRsDhzNv5opw api key
//test url https://www.youtube.com/playlist?list=PL2uxd6YWj7PKk4LnkWZEyqpcvnXmv8Iuf

//this generates our video by taking the url the user passes, stripping it of just our useable url, and then generating an iframe.
document.getElementById("generatePlaylist").addEventListener("click", function() {
    var userInputtedURL = document.getElementById("videoURL").value

    var urlFormatting = (/https:\/\/www\.youtube\.com\/playlist\?list=/);

    var formattedURL = userInputtedURL.replace(urlFormatting,"")
    console.log(formattedURL)

    playlistTypeSelector()
    searchForPlaylist(formattedURL)
});

function searchForPlaylist(urlOfPlaylist) {

    //this line is taking the "youtube.googleapis" api and fetiching all the formation in a playlist 
    //currently set to limit of 10 items, change &maxResults=10 to change this.
    //to change the url of the playlist retrieved, change the &playldistId= 's url.
    //last part is the API key, but you don't need to change that.
    
    fetch(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=${urlOfPlaylist}&key=AIzaSyAD7JowNHoI4KsaRB_eLKUMRsDhzNv5opw`)
    .then(function (response) {
        //this is just getting back the object in JSON 
        return response.json();
    })
    //this is our readable api data back
    .then(data => {
        //look through this to get your information you want.
        console.log(data)

        var playlistItems = data.items;
        
        putVideosInPlaylist(playlistItems)
    })

}

function putVideosInPlaylist(playlistItemsToShuffle) {
    //this is returning the snippet section of the api information
    var singleVideoInformation = playlistItemsToShuffle[0].snippet.resourceId.videoId
    console.log(singleVideoInformation)

    const iframeVideoLocation = `<iframe id="videoCurrentlyPlaying" width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/${singleVideoInformation}" frameborder="0" allow="encrypted-media" allowfullscreen=""></iframe>`
    var videoLocation = document.getElementById("videoLocation");
    videoLocation.innerHTML = iframeVideoLocation;
    
}

function playlistTypeSelector() {
    //this function returns the choice a user made in their preferred shuffle method and generates the card to make that choice.
    var cardLocation = document.getElementById("floatingChoiceMenu");
    var dimWebpage = document.getElementById("overlay");
    dimWebpage.style.display = "block"

}

