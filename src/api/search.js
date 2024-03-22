import { useState } from "react";
import axios from "axios";
import ReactAudioPlayer from "react-audio-player";
import { Button, Table, Form, Image } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import styled from "styled-components";
import useSpotifyAuth from "./Auth";

const Div = styled.div`
  margin: 20px 40px;
`;

const Title = styled.h3`
  margin-bottom: 20px;
  color: ##800020;
`;

const MsgField = styled.div`
  width: 250px;
  margin-top: 8px;
`;

const END_POINT = 'https://api.spotify.com/v1/search';

const SearchSongs = () => {
    const [query, setQuery] = useState('');
    const [songs, setSongs] = useState([]);
    const [message, setMessage] = useState('')
    const [playingTrackId, setPlayingTrackId] = useState(null);
    const [isloading, setIsLoading] = useState(false);

    const token = useSpotifyAuth();
  
    const searchSongs = async () => {
      if (!query) {
            setMessage("入力してください。");
            setTimeout(() => setMessage(''), 3000);
            setSongs([]);
            return;
      }
      setIsLoading(true);
      try {
        const response =  await axios(END_POINT + `?q=${query}&type=track&market=UA&limit=30`, {
          method: 'GET',
          headers: {
              Authorization: `Bearer ${token}`
          }
        });
        console.log(response.data);
        //popularityが高い順(降順)にソート
        //popularityは、アルゴリズムによって計算され、トラックの再生回数の合計とそれらの再生回数に基づいている
        //重複するトラックは個別に評価される
        const sortedSongs = response.data.tracks.items.sort((a, b) => b.popularity - a.popularity);
        const uniqueSongs = Array.from(new Set(sortedSongs.map(song => song.id))).map(id => {
            return sortedSongs.find(song => song.id === id);
        });

        setSongs(uniqueSongs);
        setIsLoading(false);
        setMessage('');
      } catch (error) {
        console.error('Error fetching songs:', error);
        if (error.response && error.response.status === 401) {
          setMessage("アクセストークンが無効または期限切れです。");
        } else {
          setMessage("エラーが発生しました。");
        }
      } finally {
        setIsLoading(false);
      }
    };

    const submitHandler = (e) => {
        if (e.key === 'Enter' && e.shiftKey) {
          e.preventDefault();
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
      <Div>
        <Title>Popular Music Search</Title>
        <Form>
          <Form.Group className="d-flex">
            <Form.Control 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={submitHandler}
              style={{ width: '250px'}} />
            <Button variant="secondary" onClick={searchSongs} disabled={isloading} >
              Search
            </Button>
          </Form.Group>
        </Form>
        <MsgField>{message}</MsgField>
        {songs && songs.length > 0 && (
        <Table style={{ marginTop: '25px' }}>
          <thead>
            <tr>
              <th>Song</th>
              <th>Artist(s)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {songs.map(song => (
                <tr key={song.id}>
                  <td>
                    <Image 
                      src={song.album.images[0].url}
                      alt={`${song.album.name}のカバー`}
                      style={{ width: '60px', height: '60px', marginRight: '20px' }}/>
                    {song.name}
                  </td>
                  <td>{song.artists.map(artist => artist.name).join(', ')}</td>
                  <td>
                    {song.preview_url ? (
                      <ReactAudioPlayer
                      id={`track-${song.id}`}
                      src={song.preview_url}
                      controls
                      volume={0.4}
                      onPlay={() => handlePlay(song.id)}
                      onEnded={playNextSong} />
                    ) : (
                      <span>プレビューが利用できません。</span>
                    )}
                  </td>
                </tr>
            ))}
          </tbody>
        </Table>
        )}
      </Div>
    )
  };
  
  export default SearchSongs;