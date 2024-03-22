import { useState, useEffect } from "react";
import axios from 'axios'
import { CLIENT_ID, CLIENT_SECRET } from "./apikey";

const useSpotifyAuth = () => {
  const [token, setToken] = useState('');

  useEffect(() => {
    const  getClientCredentialsToken = async () => {
      const authOptions = {
        method: 'POST',
        url: 'https://accounts.spotify.com/api/token',
        headers: {
          'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: 'grant_type=client_credentials'
      };
  
      try {
        const response = await axios(authOptions);
        setToken(response.data.access_token);
      } catch (error) {
        console.error('Error fetching token:', error)
      }
    };

    getClientCredentialsToken();
  }, [])
  
  return token;
};

export default useSpotifyAuth;