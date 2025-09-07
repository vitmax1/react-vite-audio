import { useRef, useState, useEffect } from "react";
import { PlayIcon, PauseIcon, NextIcon, PrevIcon, StopIcon, ShuffleIcon } from "./Icons";

export default function Player({ tracks }) {
    const audioRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1); // громкость (0–1)

    const currentTrack = tracks[currentIndex];
		

    // Загружаем трек при смене
    useEffect(() => {
        if (!audioRef.current || !currentTrack) return;

        audioRef.current.src = currentTrack.url;
        audioRef.current.load();
        audioRef.current.volume = volume;

        if (isPlaying) {
            audioRef.current.play().catch((err) => {
                if (err.name !== "AbortError") {
                    console.warn("Ошибка play():", err);
                }
            });
        }
    }, [currentTrack]);

    // Таймеры
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const setAudioData = () => setDuration(audio.duration || 0);

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", setAudioData);

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", setAudioData);
        };
    }, []);

    const handlePlay = () => {
        if (!audioRef.current) return;
        audioRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch((err) => {
                if (err.name !== "AbortError") {
                    console.warn("Ошибка play():", err);
                }
            });
    };

    const handlePause = () => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        setIsPlaying(false);
    };

    const handleStop = () => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % tracks.length);
        setIsPlaying(true);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
        setIsPlaying(true);
    };

    const handleRandom = () => {
        if (tracks.length <= 1) return;
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * tracks.length);
        } while (randomIndex === currentIndex);

        setCurrentIndex(randomIndex);
        setIsPlaying(true);
    };

    const handleSelectTrack = (index) => {
        setCurrentIndex(index);
        setIsPlaying(true);
    };

    const handleSeek = (e) => {
        if (!audioRef.current) return;
        const newTime = Number(e.target.value);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);

        if (isPlaying) {
            audioRef.current.play().catch((err) => {
                if (err.name !== "AbortError") {
                    console.warn("Ошибка play():", err);
                }
            });
        }
    };

    const handleVolume = (e) => {
        const newVolume = Number(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60)
            .toString()
            .padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    const getFormattedName = (name) => {
        if (!name || typeof name !== "string") return "Без названия";
        const cleanName = name.replace(/\.mp3$/i, ""); // убираем .mp3
        return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    };

    return (
        <div className="flex flex-col items-center space-y-5 w-full h-full">
            <h2 className="text-lg font-bold">
                {currentTrack?.name
                    ? `${
                          currentTrack.folderName || "Неизвестная папка"
                      } - ${getFormattedName(currentTrack.name)}`
                    : "Нет треков"}
            </h2>

            <audio ref={audioRef} onEnded={handleNext} preload="metadata" />

            {/* Прогресс-бар и таймер */}
            <div className="w-[90%] flex items-center space-x-2">
                <span className="text-sm">{formatTime(currentTime)}</span>
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full metal-range"
                />
                <span className="text-sm">{formatTime(duration)}</span>
            </div>

            {/* Панель управления */}
            <div className="flex space-x-4">
                <div className="btn">
                    <button className="button1" onClick={handlePrev}>
                        <PrevIcon className="cursor-pointer" />
                    </button>
                </div>

                {isPlaying ? (
                    <div className="btn">
                        <button className="button4" onClick={handlePause}>
                            <PauseIcon className="cursor-pointer" />
                        </button>
                    </div>
                ) : (
                    <div className="btn">
                        <button className="button4" onClick={handlePlay}>
                            <PlayIcon className="cursor-pointer" />
                        </button>
                    </div>
                )}

                {/* <button className="p-2 rounded-lg" onClick={handleStop}>
                    <StopIcon className="cursor-pointer" />
                </button> */}

                <div className="btn">
                    <button className="button1" onClick={handleNext}>
                        <NextIcon className="cursor-pointer" />
                    </button>
                </div>

                <div className="btn">
                    <button className="button1" onClick={handleRandom}>
                        <ShuffleIcon className="cursor-pointer" />
                    </button>
                </div>
            </div>

            {/* Контроль громкости */}
            <div className="w-[90%] flex items-center space-x-2">
                <span className="text-sm">🔊</span>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolume}
                    className="w-full metal-range"
                />
                <span className="text-sm">{Math.round(volume * 100)}%</span>
            </div>

            {/* Плейлист */}
            <div className="w-full md:w-auto">
                <ul className="w-full mt-4 bg-white rounded-lg shadow-inner divide-y divide-gray-200">
                    {tracks.map((track, index) => (
                        <li
                            key={index}
                            className={`px-3 py-1 flex space-between gap-1 cursor-pointer hover:bg-gray-100 ${
                                index === currentIndex ? "bg-blue-100" : ""
                            }`}
                            onClick={() => handleSelectTrack(index)}
                        >
                            <span
                                className={`text-gray-500 block ${
                                    index === currentIndex
                                        ? "font-semibold"
                                        : ""
                                }`}
                            >
                                {track.folderName || "Без папки"}
                            </span>{" "}
                            <span className="truncate">
                                {getFormattedName(track.name)}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
