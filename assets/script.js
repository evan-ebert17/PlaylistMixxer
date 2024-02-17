//AIzaSyAD7JowNHoI4KsaRB_eLKUMRsDhzNv5opw api key
function searchPlaylist() {

    fetch(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=FLw4TPXtSkpqBnyFualskAJA&key=AIzaSyAD7JowNHoI4KsaRB_eLKUMRsDhzNv5opw`)
    .then(function (response) {
        return response.json();
    })
    .then(data => {
        console.log(data)
    })

}

searchPlaylist();

//this generates our video by taking the url the user passes, stripping it of just our useable url, and then generating an iframe.
// document.getElementById("generatePlaylist").addEventListener("click", function() {
//     var userInputtedURL = document.getElementById("videoURL").value
//     var videoLocation = document.getElementById("videoLocation");

//     var formattedURL = (/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);

//     const iframeVideoLocation = `<iframe id="videoCurrentlyPlaying" width="100%" height="100%" src="https://www.youtube.com/embed/${formattedURL[1]}" frameborder="0" allow="encrypted-media" allowfullscreen=""></iframe>`

//     videoLocation.innerHTML = iframeVideoLocation;
// });


