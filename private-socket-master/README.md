### Run server (default PORT = 1410)
```
cd server/src
python server.py
```

### Run client 
```
cd client
yarn install
yarn start
```

### Functional
- Click SETUP button
- Click BACKWARD button
- Click PLAY button
- Click FORWARD button
- Click PAUSE button

### Flow of Client
- Connect to socket (RTSP and RTP)
- Send RTSP packet
- Receive RTSP packet 
- Receive RTP packet 
- Decode RTP packet (from byte to img)
- Display img 
