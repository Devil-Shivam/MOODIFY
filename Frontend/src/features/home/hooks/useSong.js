import { getSong } from "../service/song.api";
import { useContext } from "react";
import { SongContext } from "../song.context";


export const useSong = () => {
    const context = useContext(SongContext)

    const { loading, setLoading, song, setSong } = context

    async function handleGetSong({ mood }) {
        setLoading(true)
        const data = await getSong({ mood })
        setSong(data.song)
        setLoading(false)
    }

    async function handleNextSong() {
        if (!song?.mood) return
        await handleGetSong({ mood: song.mood })
    }

    return ({ loading, song, setSong, handleGetSong, handleNextSong })
}
