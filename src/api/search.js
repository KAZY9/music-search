import { useState } from "react";
import axios from "axios";
import useSpotifyAuth from "./Auth";

const END_POINT = 'https://api.spotify.com/v1/search';

const SearchSongs = () => {
    const [query, setQuery] = useState('');
    const [songs, setSongs] = useState([]);
    const [message, setMessage] = useState('')
    const token = useSpotifyAuth();
  
    const searchSongs = async () => {
      if (!query) {
            setMessage("入力してください。");
            setTimeout(() => setMessage(''), 3000);
            setSongs([]);
            return;
      }
      try {
        const response =  await axios(END_POINT + `?q=${query}&type=track&limit=30&market=JP`, {
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

        // const uniqueSongs = Array.from(new Set(soretedSongs.map(song => song.id))).map(id => {
        //     return soretedSongs.find(song => song.id === id);
        // });

        const groupedSongs = soretedSongs.reduce((acc, song) => {
          if (!acc[song.name]) {
            acc[song.name] = [];
          }
          acc[song.name].push(song);
          return acc;
        }, []);

        const uniqueSongs = Object.values(groupedSongs).map(group => {
          return group.reduce((max, song) => (song.popularity > max.popularity ? song : max), group[0]);
        });

        const first10Songs = uniqueSongs.slice(0, 10);

        setSongs(first10Songs);
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
                <td>{song.name}</td>
                <td>{song.artists.map(artist => artist.name)}</td>
                <td>{song.popularity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    )
  };
  
  export default SearchSongs;