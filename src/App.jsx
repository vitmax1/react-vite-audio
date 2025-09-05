import { useEffect, useState } from "react";
import Player from "./components/Player";

function App() {
    const [tracks, setTracks] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/folders");
                const data = await res.json();
                
                setTracks(data);
            } catch (err) {
                console.error("Ошибка загрузки:", err);
            }
        };

        fetchData();
    }, []);


    return (
        <div
            className="relative min-h-screen bg-cover bg-center"
            style={{ backgroundImage: "url('/wp-1.jpg')" }}
        >
            <div className="absolute inset-0 bg-black opacity-60"></div>
            <div className="flex justify-center items-center h-screen">
                <div className="p-4 z-999">
                    {/* <h1 className="text-3xl font-bold mb-6 text-center">
                    🎶 Слушай RAP
                </h1> */}
                    
                    {tracks.length > 0 ? (
                        <Player tracks={tracks} />
                    ) : (
                        <p className="text-center">Загрузка треков...</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
