const playBtnIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/></svg>`;
const stopBtnIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-stop-fill" viewBox="0 0 16 16"><path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5"/></svg>`;

let artistArray = [];
let resultsCount = 0;

function loop() {
    // If you have this on the outside of this function it builds an empty array
    // because it loads before the data
    
    //////////////////////////////// Important note /////////////////////////////////
    let listOfSongs = document.querySelectorAll(".song");

    for (let i = 0; i < listOfSongs.length; i++) {
        let songItem = listOfSongs[i];
        let currentlyPlaying = songItem.getAttribute("data-playing");

        if (currentlyPlaying === "true") {
            let currentMusicID = songItem.getAttribute("data-music-id");
            return currentMusicID;
        } 
    }
    return 0;
}

function playStop(id) {
    let musicID = id.getAttribute("data-music-id");
    let playStopBtn = document.getElementById(`playStopBTN${musicID}`);
    let audio = document.getElementById(`audio${musicID}`);
    
    let isAnythingPlaying = loop();

    // the ended event listener resets the button icon
    // and it sets the data-playing attribute back to false
    audio.addEventListener('ended', () => {
        playStopBtn.innerHTML = playBtnIcon;
        playStopBtn.setAttribute('data-playing', 'false');
    });

    if (isAnythingPlaying !== 0) {
        // If the same song is clicked again
        if (isAnythingPlaying === musicID) {
            if (audio.paused) {
                audioProgress(audio, musicID);
                audio.play();
                playStopBtn.innerHTML = stopBtnIcon;
                playStopBtn.setAttribute('data-playing', 'false');
                // console.log(playStopBtn);
            } else {
                audio.pause();
                audio.currentTime = 0;  
                playStopBtn.innerHTML = playBtnIcon;
                playStopBtn.setAttribute('data-playing', 'false');
            }
        } else {
            // If a different song is clicked, stop the currently playing song and play the new one
            let tempAudio = document.getElementById(`audio${isAnythingPlaying}`);
            let tempBtn = document.getElementById(`playStopBTN${isAnythingPlaying}`);

            tempAudio.pause();
            tempAudio.currentTime = 0;
            tempBtn.innerHTML = playBtnIcon;
            tempBtn.setAttribute('data-playing', 'false');
            audioProgress(audio, musicID);
            audio.play();
            playStopBtn.innerHTML = stopBtnIcon;
            playStopBtn.setAttribute('data-playing', 'true');
        }
    } else {
        // If no song is currently playing, play the clicked song
        audioProgress(audio, musicID);
        audio.play();
        playStopBtn.innerHTML = stopBtnIcon;
        playStopBtn.setAttribute('data-playing', 'true');
    } 
}

function audioProgress(audio, musicID) {
    function setProgress(progress) {
        let circularProgress = document.getElementById(`playStopProgress${musicID}`);
        circularProgress.style.background = `conic-gradient(#7d2ae8 ${progress * 3.6}deg, #fff 0deg)`;
    }
    
    audio.addEventListener('timeupdate', (e)=> {
        
        let currentTime = e.target.currentTime;
        let duration = e.target.duration;
        
        let progressWidth = ((currentTime / duration) * 100);
        
        setProgress(progressWidth);
            
        if (progressWidth == 100) {
            setProgress(0);
        }
    });
}

function runSearch() {
    
    document.querySelector("#searchForm").addEventListener("click", function(event) {
        event.preventDefault();
    }, false);

    let searchBox = document.querySelector("#searchBox").value;

    if (searchBox !== "" && searchBox !== " ") {
        searchBox = searchBox.trim();
        setURLParams(searchBox);
        getArtist(searchBox);
    }
}

function displaySearchResults() {
    
    const resultsList = document.getElementById("results");
    resultsList.innerHTML = "";
    artistArray.forEach((songs, index) => {
        if (songs.wrapperType == "track") {
            let indexPlusOne = index + 1;
            let placeholder = "";
            
            if (indexPlusOne < 10) {
                placeholder = `0${indexPlusOne}`;
            } else {
                placeholder = indexPlusOne;
            }

            let listItem = `
                <div class="song-wrapper"> 
                    <h2 class="track-number">${placeholder}</h2>
                    <div class="image-wrapper">
                        <img src="${songs.artworkUrl60}">
                    </div>
                    <audio id="audio${indexPlusOne}">
                        <source src="${songs.previewUrl}" type="audio/mpeg">
                    </audio>
                    <div class="play-grouping">
                        <div id="playStopProgress${indexPlusOne}" class="circular-progress">
                            <button id="playStopBTN${indexPlusOne}" class="song" onclick="playStop(this)" data-music-id="${indexPlusOne}" data-playing="false" type="button" title="play song ${indexPlusOne}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="track-artist-wrapper">
                        <p class="track-name">${songs.trackName}</p>
                        <p>${songs.artistName}</p>
                    </div>
                    <div class="apple-music-logo">
                        <a href="${songs.trackViewUrl}" target="_blank">
                        <img src="US-UK_Apple_Music_Listen_on_Badge_RGB_072720.svg" class="apple-music-logo" alt="Listen on Apple Music">
                        </a>
                    </div>
                </div>
            `;
    
            resultsList.insertAdjacentHTML("beforeend", listItem);
        }
    });
}

async function getArtist(artistName) {

    //iTunes API
    const count = 10;
    const apiUrl = `https://itunes.apple.com/search?term=${artistName}&limit=${count}&media=music`;
    
    try {
        const response = await fetch(apiUrl);
        // const data = await response.json();
        artistArray = await response.json();
        resultsCount = artistArray.resultCount;
        artistArray = artistArray.results
        displaySearchResults();
    } catch (error) {
        // Catch error here
    }
}

function onPageLoad() {

    // ChatGPT way
    const urlParams = new URLSearchParams(window.location.search);
    // term because that is what the itunes api uses
    const paramValue = urlParams.get('term'); 

    if (paramValue != null) {
        // set text box
        // call runSearch function
        let searchBox = document.getElementById("searchBox");
        searchBox.value = paramValue;
        runSearch();
    }
}

function setURLParams(value) {
    // get the current URL's search parameters
    const searchParams = new URLSearchParams(window.location.search);
    
    // update or add the parameter
    searchParams.set("term", value);
    
    // replace the current URL's search string with the updated parameters
    const newURL = `${window.location.pathname}?${searchParams.toString()}`;

    // change the URL without reloading the page
    window.history.replaceState({}, '', newURL);
}

//On Load function fires to see if there are any query parameters
//such as a previous search such as a bookmarked or favorited search
onPageLoad();