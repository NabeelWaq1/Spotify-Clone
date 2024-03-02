let play = document.getElementById("play");
let currentSong = new Audio();
let songs;
let currentFolder;
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currentFolder = folder;
  let a = await fetch(`/${currentFolder}`);
  let response = await a.text();
  // console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  // console.log(as)
  songs = [];
  console.log(songs)
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${currentFolder}/`)[1]);
      console.log(currentFolder)
    }
  }
  let songUl = document.querySelector(".play-songs").getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      ` <li>
       <div class="music-icon">
       <img class="invert" src="music.svg" alt="">
       </div>
       <div class="info">
           <div>${song.replaceAll("%20", " ")}</div>
           <div>Nabeel</div>
       </div>
       <div class="play-now">
           <img class="invert" src="play.svg" alt="">
       </div>
   </li>`;
  }

  // audio.play();
  Array.from(
    document.querySelector(".play-songs").getElementsByTagName("li")
  ).forEach((e) => {
    // playSong(e)
    e.addEventListener("click", (element) => {
      playSong(e.querySelector(".info").firstElementChild.innerText.trim());
    });
  });
  return songs;
}

function playSong(track, pause = false) {
  currentSong.src = `/${currentFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".song-info").innerHTML = decodeURI(track);
  document.querySelector(".song-time").innerHTML = "00:00/00:00";
}

async function addAlbums() {
  let a = await fetch(`/songs`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/")[4];
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      let cardCont = document.querySelector(".cardContainer");
      cardCont.innerHTML =
        cardCont.innerHTML +
        `  <div data-folder="${folder}" class="card">
            <svg class="play-but" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
                <!-- Circle background -->
                <circle cx="15" cy="15" r="15" fill="#4CAF50" />

                <!-- Play icon -->
                <polygon points="10,7.5 10,22.5 20,15" fill="#000000" />
            </svg>


            <img src="/songs/${folder}/cover.jpeg" alt="playlist-1">
            <h4>${response.title}</h4>
            <p>${response.description}</p>
        </div>`;
    }

    // Add an event listener on cards
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
      e.addEventListener("click", async (item) => {
        // console.log(item.currentTarget.dataset.folder)
        songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);

        playSong(songs[0]);
      });
    });
  }
}

async function main() {
  await getSongs("songs/1");
  playSong(songs[0], true);

  //adding song albums
  addAlbums();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".song-time").innerHTML = `${formatTime(
      Math.floor(currentSong.currentTime)
    )}/${formatTime(Math.floor(currentSong.duration))}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seek-bar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Adding a event listener to hamburger icon
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Adding a event listener to close icon
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120" + "%";
  });

  //Adding a event listener to previous
  document.getElementById("previous").addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice("-1")[0]);
    if (index - 1 >= 0) {
      playSong(songs[index - 1]);
    }
  });

  //Adding a event listener to next
  document.getElementById("next").addEventListener("click", () => {
    console.log(currentSong.src);
    let index = songs.indexOf(currentSong.src.split("/").slice("-1")[0]);
    console.log(currentSong.src.split("/").slice("-1")[0]);
    if (index + 1 < songs.length) {
      playSong(songs[index + 1]);
    }
  });

  //Adding an event listener to volume
  document
    .querySelector(".volume")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Changing Volume To : ", e.target.value, " / 100");
      currentSong.volume = parseInt(e.target.value) / 100;
    });
}
main();
