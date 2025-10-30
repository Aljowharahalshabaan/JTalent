import { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  Play, 
  Pause, 
  Square, 
  Camera,
  Download,
  Star,
  MessageCircle
} from 'lucide-react';
import { useLanguage } from '@/react-app/hooks/useLanguage';

interface VideoScreeningProps {
  candidateId?: number;
  jobPostingId?: number;
  questions: string[];
  onComplete?: (responses: VideoResponse[]) => void;
}

interface VideoResponse {
  questionIndex: number;
  question: string;
  videoBlob?: Blob;
  duration: number;
  timestamp: string;
}

export default function VideoScreening({ questions, onComplete }: VideoScreeningProps) {
  const { t, isRTL } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [responses, setResponses] = useState<VideoResponse[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) {
      await startCamera();
    }

    if (streamRef.current) {
      const recorder = new MediaRecorder(streamRef.current);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const newResponse: VideoResponse = {
          questionIndex: currentQuestion,
          question: questions[currentQuestion],
          videoBlob: blob,
          duration: recordingTime,
          timestamp: new Date().toISOString()
        };
        
        setResponses(prev => [...prev, newResponse]);
        setRecordingTime(0);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && isRecording) {
      if (isPaused) {
        mediaRecorder.resume();
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorder.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setRecordingTime(0);
    } else {
      setIsCompleted(true);
      if (onComplete) {
        onComplete(responses);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    startCamera();
  }, []);

  if (isCompleted) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center py-12 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('video.completed')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Video screening completed successfully. Responses are being processed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {responses.map((response, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Question {index + 1}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {response.question}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Duration: {formatTime(response.duration)}</span>
                {response.videoBlob && (
                  <button className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 space-y-6 ${isRTL ? 'font-arabic' : ''}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('video.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Current Question */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Question {currentQuestion + 1}
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              {questions[currentQuestion]}
            </p>
          </div>
        </div>
      </div>

      {/* Video Preview */}
      <div className="bg-gray-900 rounded-xl overflow-hidden aspect-video relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            REC {formatTime(recordingTime)}
          </div>
        )}
        
        {/* Camera Permission */}
        {!streamRef.current && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-white">
              <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Camera access required</p>
              <button
                onClick={startCamera}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                Enable Camera
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={!streamRef.current}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Video className="w-5 h-5" />
            Start Recording
          </button>
        ) : (
          <>
            <button
              onClick={pauseRecording}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          disabled={currentQuestion === 0}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Previous Question
        </button>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {responses.filter(r => r.questionIndex <= currentQuestion).length} of {currentQuestion + 1} answered
        </div>
        
        <button
          onClick={nextQuestion}
          disabled={!responses.find(r => r.questionIndex === currentQuestion)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {currentQuestion === questions.length - 1 ? 'Complete' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}
