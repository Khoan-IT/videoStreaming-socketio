import React, { useState } from 'react'
import io from 'socket.io-client'
import {Box, Button} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import FastForwardIcon from '@mui/icons-material/FastForward'
import FastRewindIcon from '@mui/icons-material/FastRewind'
import StopIcon from '@mui/icons-material/Stop';
import PauseIcon from '@mui/icons-material/Pause';
import SettingsIcon from '@mui/icons-material/Settings';

const INIT = 0;
const READY = 1;
const PLAYING = 2;
var state = INIT;
const SETUP = 0;
const PLAY = 1;
const PAUSE = 2;
const TEARDOWN = 3;
const FASTFORWARD = 4;
const BACKWARD = 5;
const SWITCH = 6;

const serverAddr = 'localhost';
const serverPort = 3000;
const rtpPort = 2;
const filename = 'movie.Mjpeg';

var rtspSeq = 0;
var sessionId = 0;
var requestSent = -1;
var teardownAcked = 0;
var frameNbr = 0;

var socket = '';

function HomePage() {

	const setupMovie = () => {
		socket = io.connect('ws://127.0.0.1:1410')
		if (state === INIT) {
			sendRtspRequest(SETUP);
		}

	}


	const exitClient = () => {
		sendRtspRequest(TEARDOWN);
	}

	const pauseMovie = () => {
		console.log('state'+String(state))
		if(state === PLAYING) {
			sendRtspRequest(PAUSE);
		}
	}

	const playMovie = () => {
		if (state === READY) {
			listenRtp();
			sendRtspRequest(PLAY);
		}
	}

	const fastForward= () => {
		if (state!==INIT){
			sendRtspRequest(FASTFORWARD);
		}
	}

	const fastBackward= () => {
		if(state!==INIT){
			sendRtspRequest(BACKWARD);
		}
	}

	const switchMovie= () => {
		if(state===INIT){
			sendRtspRequest(SWITCH);
		}
	}

	const listenRtp = () => {
		socket.on('recvRTP', function(data){
				var count = Object.keys(data).length;
				if(count===1){
					if(typeof data.status==="string"){
						var img = 'https://i.pinimg.com/736x/03/9e/1c/039e1c11cb133d1f09f9f078c48b94cf.jpg';//link image when teardown
						setImgSrc(img);
						sessionId = 0;
						requestSent = -1;
						teardownAcked = 0;
						frameNbr = 0;
						state = INIT;
					}else{
						var img = data.status;
						var base64String = arrayBufferToBase64(img);
						setImgSrc('data:image/png;base64,'+ base64String);
					}
				}else{
					var currFrameNbr = parseInt(data.frameNum);
					frameNbr = currFrameNbr;
					var img = data.img;
					var base64String = arrayBufferToBase64(img);
					setImgSrc('data:image/png;base64,'+ base64String);
					// console.log(frameNbr);
					//Show image on web
				}
			})
	}

	const arrayBufferToBase64 = ( buffer ) => {
		var binary = '';
		var bytes = new Uint8Array( buffer );
		var len = bytes.byteLength;
		for (var i = 0; i < len; i++) {
			binary += String.fromCharCode( bytes[ i ] );
		}
		return window.btoa( binary );
	}

	const sendRtspRequest = (requestCode) =>{
		console.log(requestCode,state);
		var request = "";
		if (requestCode===SETUP && state===INIT) {
			rtspSeq+=1;
			request = 'SETUP ' + filename +  ' RTSP/1.0\nCSeq: ' + String(rtspSeq) + '\nTransport: RTP/UDP; client_port= ' + String(rtpPort);
			requestSent  = SETUP;
		}else if (requestCode===PLAY && state===READY) {
			rtspSeq+=1;
			request = 'PLAY ' + filename + ' RTSP/1.0\nCSeq: ' + String(rtspSeq) + '\nSession: ' + String(sessionId);
			requestSent=PLAY;
		}else if(requestCode===PAUSE && state===PLAYING){
			rtspSeq+=1;
			console.log('aloooooooooo')
			request = 'PAUSE ' + filename + ' RTSP/1.0\nCSeq: ' + String(rtspSeq) + '\nSession: ' + String(sessionId);
			requestSent=PAUSE;
		}else if(requestCode===TEARDOWN && state!==INIT){
			rtspSeq+=1;
			request = 'TEARDOWN ' + filename + ' RTSP/1.0\nCSeq: ' + String(rtspSeq) + '\nSession: ' + String(sessionId);
			requestSent=TEARDOWN;
		}else if(requestCode===FASTFORWARD){
			rtspSeq+=1;
			request = 'FASTFORWARD ' + filename + ' RTSP/1.0\nCSeq: ' + String(rtspSeq) + '\nSession: ' + String(sessionId);
			requestSent=FASTFORWARD;
		}else if(requestCode===BACKWARD){
			rtspSeq+=1;
			request = 'BACKWARD ' + filename + ' RTSP/1.0\nCSeq: ' + String(rtspSeq) + '\nSession: ' + String(sessionId);
			requestSent=BACKWARD;
		}else{
			return;
		}
		recvRtspReply();
		socket.emit('RTSP',request);
		console.log('\nData sent:\n' + request);
		
	}

	const recvRtspReply=()=>{
		socket.on('recvRTSP',function(reply){
			var data = reply;
			if (data!==''){
				var lines = data.split('\n')
				var seqNum = parseInt(lines[1].split(' ')[1])
				if (seqNum===rtspSeq){
					var session = parseInt(lines[2].split(' ')[1]);
					if (sessionId===0){
						sessionId = session;
					}
					if (sessionId===session){
						if (parseInt(lines[0].split(' ')[1])===200){
							if (requestSent===SETUP){
								state=READY;
							}else if(requestSent===PLAY){
								state=PLAYING;
							}else if(requestSent===PAUSE){
								state = READY;
							}else if(requestSent===SWITCH){
								state = READY;
							}else if (requestSent===TEARDOWN){
								state = INIT;
								teardownAcked = 1;
							}
						}
					}

				}
			}	
		})
	}


	const [imgSrc, setImgSrc] = useState('https://9mobi.vn/cf/images/2015/03/nkk/hinh-anh-dep-1.jpg');
  
	return (
		<Box sx={{backgroundColor: '#303030', height: '100vh', justifyContent:'center', display:'flex'}}>
			<Box sx={{
				height: '95%', width: 'wrap-content', backgroundColor: '#303030', display:'flex', 
				flexDirection:'column', justifyContent: 'space-between'
			}}>
				<Box sx={{
					justifyContent: 'center', display:'flex', 
					backgroundColor: '#303030', width: '100%', mt: 4,
					color: '#fff', fontSize:'32px', fontWeight: 700,
				}}>
					Video Streaming
				</Box>
				<Box sx={{
					justifyContent: 'center', display:'flex',
					backgroundColor: '#303030'
				}}>
					<img src={imgSrc} alt='Video' style={{width: 1000, height: 490}}/>
				</Box>

				<Box sx={{
					justifyContent: 'space-between', display:'flex', width: '100%',
					backgroundColor: '#303030', 
				}}>
					<Box sx={{display:'flex'}}>
						<Button onClick={fastBackward}><FastRewindIcon sx={{ height: 30, color: '#fff'}}/></Button>
						<Button onClick={playMovie}><PlayArrowIcon  sx={{height: 30, color: '#fff'}}/></Button>
						<Button onClick={pauseMovie}><PauseIcon  sx={{height: 30, color: '#fff'}}/></Button>
						<Button onClick={fastForward}><FastForwardIcon  sx={{height: 30, color: '#fff'}}/></Button>

					</Box>
					<Box sx={{display:'flex'}}>
						<Button onClick={exitClient}><StopIcon  sx={{height: 30, color: '#fff'}}/></Button>
						<Button onClick={setupMovie}><SettingsIcon sx={{height: 30, color: '#fff'}}/></Button>
					</Box>
				</Box>
			</Box>
		</Box>
	)
}

export default HomePage
