import { useState } from "react";
import axios from "axios";
import ReactAudioPlayer from "react-audio-player";
import useSpotifyAuth from "./Auth";

const END_POINT = 'https://api.spotify.com/v1/search';

const SearchSongs = () => {
    const [query, setQuery] = useState('');
    const [songs, setSongs] = useState([]);
    const [message, setMessage] = useState('')
    const [playingTrackId, setPlayingTrackId] = useState(null);

    const token = useSpotifyAuth();
  
    const searchSongs = async () => {
      if (!query) {
            setMessage("入力してください。");
            setTimeout(() => setMessage(''), 3000);
            setSongs([]);
            return;
      }
      try {
        const response =  await axios(END_POINT + `?q=${query}&type=track&market=UA`, {
          method: 'GET',
          headers: {
              Authorization: `Bearer ${token}`
          }
        });
        console.log(response.data);
        //popularityが高い順(降順)にソート
        //popularityは、アルゴリズムによって計算され、トラックの再生回数の合計とそれらの再生回数に基づいている
        //重複するトラックは個別に評価される
        const soretedSongs = response.data.tracks.items.sort((a, b) => b.popularity - a.popularity);

        const uniqueSongs = Array.from(new Set(soretedSongs.map(song => song.id))).map(id => {
            return soretedSongs.find(song => song.id === id);
        });

        // const groupedSongs = soretedSongs.reduce((acc, song) => {
        //   if (!acc[song.name]) {
        //     acc[song.name] = [];
        //   }
        //   acc[song.name].push(song);
        //   return acc;
        // }, []);

        // const uniqueSongs = Object.values(groupedSongs).map(group => {
        //   return group.reduce((max, song) => (song.popularity > max.popularity ? song : max), group[0]);
        // });

        setSongs(uniqueSongs);
        setMessage('');
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };

    const submitHandler = (e) => {
        if (e.key === 'Enter' && e.shiftKey) {
            searchSongs();
        }
    }

    const handlePlay = (selectedTrackId) => {
      const audioElements = document.querySelectorAll('audio');

      audioElements.forEach(audio => {
        if (audio.id !== `track-${selectedTrackId.toString()}`) {
          audio.pause();
          audio.currentTime = 0;
        }
      });

      setPlayingTrackId(selectedTrackId);
    }

    const playNextSong = () => {
      const currentIndex = songs.findIndex(song => song.id === playingTrackId);
      const nextIndex = currentIndex + 1;

      // if(nextIndex < songs.length) {
      //   handlePlay(songs[nextIndex].id);
      // }
      if (nextIndex < songs.length) {
        const nextSongId = songs[nextIndex].id;
        const nextAudioElement = document.getElementById(`track-${nextSongId}`);
        if (nextAudioElement) {
          nextAudioElement.play();
          setPlayingTrackId(nextSongId);
        }
      }
    }
  
    return (
      <div>
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={submitHandler} />
        <button onClick={searchSongs}>Search</button>
        <div>{message}</div>
        {songs && songs.length > 0 && (
          <table>
          <thead>
            <tr>
              <th>Song</th>
              <th>Artist(s)</th>
            </tr>
          </thead>
          <tbody>
            {songs.map(song => (
                <tr key={song.id}>
                  <td>
                    <img src={song.album.images[0].url} alt="Album cover" style={{ width: '50px', height: '50px', marginRight: '10px' }}/>
                    {song.name}
                  </td>
                  <td>{song.artists.map(artist => artist.name).join(', ')}</td>
                  <td>
                    <ReactAudioPlayer
                      id={`track-${song.id}`}
                      src={song.preview_url}
                      controls
                      volume={0.4}
                      onPlay={() => handlePlay(song.id)}
                      onEnded={playNextSong} />
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    )
  };
  
  export default SearchSongs;