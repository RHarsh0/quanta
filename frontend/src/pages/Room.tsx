import  { useEffect, useMemo, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import avatarvideo from "../../src/assets/avatarvideo.mp4";
import avatarhold from '../../src/assets/avatarhold.mp4';
import avatarimg from '../../src/assets/avatarimage.jpg';
import Speech from 'react-text-to-speech';
import { sendAnswer, startInterview } from '../Api';
export const Room = () => {
  const [text, setText] = useState<string>("");
  const [turn, setTurn] = useState<Boolean>(true);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognition = useRef<SpeechRecognition | null>(null);
  const [ques, setQues] = useState("");
  const handleStartCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setVideoStream(new MediaStream(stream.getVideoTracks()));
      setAudioStream(new MediaStream(stream.getAudioTracks()));
    } catch (error) {
      console.error('Error accessing microphone/camera:', error);
    }
  };

  useEffect(()=>{
    let question: string = "";
   const getQuestion= async()=>{
    question = await startInterview();
    setQues(question);
   }
   getQuestion();
  }, []);


const handleVideo =()=>{
    setTurn(true);
}

  useEffect(()=>{
    if ('speechSynthesis' in window) {
      setTurn(false);
      let utterance = new SpeechSynthesisUtterance(ques);
      speechSynthesis.speak(utterance);
      
      setTimeout(()=>{
        handleVideo();
      }, 2000);
      
      
     }else{
      alert("sorry, your browser is not supporting speechSynthesis");
     }
  }, [ques]);

  useEffect(() => {
    handleStartCapture();
    handleTurns();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.srcObject = audioStream;
      setupSpeechRecognition();
    }
  }, [audioStream]);


  const setupSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition is not supported in this browser');
      return;
    }

    recognition.current = new SpeechRecognition();
    recognition.current.continuous = true;
    recognition.current.interimResults = true;
    recognition.current.lang = 'en-US';

    recognition.current.onresult = (event) => {
      // let transcript = "";
      // const results = event.results;
      // const lastResult = results[results.length - 1];
      // for (let i = 0; i < lastResult.length; i++) {
      //   transcript += lastResult[i].transcript;
      // }
      // console.log(transcript);
      // setText((prev)=> prev + transcript);

      const transcript = Array.from(event.results)
        .map((result) =>
          result[0].transcript)
        .join('');
    
 
    
      setText(transcript);
    };
    recognition.current.start();
    // recognition.current.onend = () => {
      
    //   recognition.current?.start();
    // };

    
  };

  const handleSend = async ()=>{
   let submit = await sendAnswer(text);
  console.log(submit);
  }
  const handleTurns = ()=>{
    
  }
  return (
    <div className='min-h-screen bg-[#ECF0FB] flex flex-col justify-center items-center gap-12'>
      
      <div className="flex gap-8">
        <video  ref={videoRef} autoPlay playsInline muted width={"350px"}  height={"350px"} className='object-cover'></video>
       {!turn && <ReactPlayer
            className='react-player ease-in-out'
            url= {avatarvideo}
            width={"350px"}
            height={"360px"}
            muted={true}
            playing={true}
            />}
            {turn && <ReactPlayer
            className='react-player ease-in'
            url= {avatarhold}
            width={"350px"} 
            height={"360px"}
            muted={true}
            playing={true}
            />}
      </div>
    <audio ref={audioRef} autoPlay muted></audio>
      <div className="flex">
        <textarea
          className="w-96 p-3 rounded-lg border-gray-200 border-solid border-2 focus:outline-none overflow-y-scroll max-h-100 resize-none"
          placeholder='Enter text...'
          value={text || ""}
          onChange={(e) => setText(e.target.value)}
        />
        <button className='p-3 rounded-lg border-gray-200 bg-white border-solid border-2 m-3' onClick={() => {handleSend()}}>Send</button>
      </div>
    </div>
  );
};