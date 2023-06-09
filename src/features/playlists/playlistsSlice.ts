// eslint-disable-next-line import/named
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase";
import { Playlist, Song, Status } from "../../helpers/types";
import { toast } from "react-toastify";
import { options } from "../../components/Song";

export interface PlaylistsState {
  selectedPlaylist?: Playlist;
  userPlaylists: Playlist[];
  likedSongsPlaylist: Playlist | undefined;
  userPlaylistsExpectLikedSongs: Playlist[];
  userPlaylistsStatus: Status;
  selectedPlaylistStatus: Status;
  userPlaylistsErrorMsg: string;
  selectedPlaylistErrorMsg: string;
}

const initialState: PlaylistsState = {
  userPlaylists: [],
  selectedPlaylist: undefined,
  likedSongsPlaylist: undefined,
  userPlaylistsExpectLikedSongs: [],
  userPlaylistsStatus: "idle",
  selectedPlaylistStatus: "idle",
  userPlaylistsErrorMsg: "",
  selectedPlaylistErrorMsg: "",
};
// todo: Only owner of the liked songs playlist can see this playlist
// todo: Add property is_private to playlist in supabase database

export const playlistsSlice = createSlice({
  name: "playlists",
  initialState,
  reducers: {
    filterOutSong: (state, actions: PayloadAction<{ songId: string; playlistId: string }>) => {
      const foundPlaylist = state.userPlaylists.find((playlist) => playlist.id === actions.payload.playlistId);
      if (!foundPlaylist) return;

      const filterOutSongs = foundPlaylist.songs.filter((song) => song.id !== actions.payload.songId);
      if (!filterOutSongs) return;

      foundPlaylist.songs = filterOutSongs;

      const filterOutPlaylist = state.userPlaylists.filter((playlist) => playlist.id !== foundPlaylist.id);

      state.userPlaylists = [...filterOutPlaylist, foundPlaylist];
      if (state.selectedPlaylist) {
        state.selectedPlaylist = foundPlaylist;
      }
    },
    addSongToPlaylist: (state, action: PayloadAction<{ playlistId: string; song: Song }>) => {
      const foundPlaylistIndex = state.userPlaylists.findIndex((playlist) => playlist.id === action.payload.playlistId);

      state.userPlaylists[foundPlaylistIndex].songs = [
        ...state.userPlaylists[foundPlaylistIndex].songs,
        action.payload.song,
      ];
    },
    removeSongFromSelectedPlaylist: (state, action: PayloadAction<string>) => {
      if (!state.selectedPlaylist) return;

      state.selectedPlaylist.songs = state.selectedPlaylist?.songs.filter((song) => song.id !== action.payload);
    },
    addSongToSelectedPlaylist: (state, action: PayloadAction<Song>) => {
      if (!state.selectedPlaylist) return;

      state.selectedPlaylist.songs = [...state.selectedPlaylist.songs, action.payload];
    },
    filterOutPlaylist: (state, action: PayloadAction<string>) => {
      state.userPlaylists = state.userPlaylists.filter((playlist) => playlist.id !== action.payload);

      state.userPlaylistsExpectLikedSongs = state.userPlaylistsExpectLikedSongs.filter(
        (playlist) => playlist.id !== action.payload,
      );
    },
    addPlaylistToCurrentFetched: (state, action: PayloadAction<Playlist>) => {
      state.userPlaylists = [...state.userPlaylists, action.payload];
      state.userPlaylistsExpectLikedSongs = [...state.userPlaylistsExpectLikedSongs, action.payload];
    },
  },
  extraReducers(builder) {
    builder.addCase(getUserPlaylists.fulfilled, (state, action) => {
      state.userPlaylistsStatus = "succeeded";

      state.likedSongsPlaylist = action.payload.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )[0];

      state.userPlaylistsExpectLikedSongs = action.payload.filter(
        (playlist) => playlist.id !== state.likedSongsPlaylist?.id,
      );

      state.userPlaylists = action.payload;
    });
    builder.addCase(getUserPlaylists.pending, (state) => {
      state.userPlaylistsStatus = "loading";
    });
    builder.addCase(getUserPlaylists.rejected, (state, action) => {
      state.userPlaylistsStatus = "failed";
      state.userPlaylistsErrorMsg = action.payload?.toString() ?? "";
    });
    builder.addCase(getPlaylist.fulfilled, (state, action) => {
      state.selectedPlaylistStatus = "succeeded";
      state.selectedPlaylist = action.payload;
    });
    builder.addCase(getPlaylist.pending, (state) => {
      state.selectedPlaylistStatus = "loading";
    });
    builder.addCase(getPlaylist.rejected, (state, action) => {
      state.selectedPlaylistStatus = "failed";
      state.selectedPlaylistErrorMsg = action.payload?.toString() ?? "";
    });

    builder.addCase(removeFromLikedSongsPlaylist.fulfilled, (state, action) => {
      if (!state.likedSongsPlaylist) return;
      if (state.likedSongsPlaylist) {
        state.likedSongsPlaylist.songs = state.likedSongsPlaylist.songs.filter((song) => song.id !== action.payload);

        toast.success("Successfully removed song from playlist", options);
      }
    });

    builder.addCase(addToLikedSongsPlaylist.fulfilled, (state, action) => {
      if (state.likedSongsPlaylist) {
        state.likedSongsPlaylist.songs = [...state.likedSongsPlaylist.songs, action.payload];

        toast.success("Successfully added song to liked songs", options);
      }
    });
  },
});

export const removeFromLikedSongsPlaylist = createAsyncThunk(
  "playlists/removeFromLikedSongsPlaylist",
  async (params: { songId: string; likedSongsPlaylistId: string }, { rejectWithValue }) => {
    const { error } = await supabase
      .from("songs")
      .delete()
      .match({ song_id: params.songId, playlist_id: params.likedSongsPlaylistId });

    if (error) {
      toast.error(error.message, options);
      return rejectWithValue(error.message);
    }

    return params.songId;
  },
);

export const addToLikedSongsPlaylist = createAsyncThunk(
  "playlists/addToLikedSongsPlaylist",
  async (params: { song: Song; likedSongsPlaylistId: string }, { rejectWithValue }) => {
    const { error } = await supabase
      .from("songs")
      .insert({ song_id: params.song.id, playlist_id: params.likedSongsPlaylistId });

    if (error) {
      toast.error(error.message, options);
      return rejectWithValue(error.message);
    }

    return params.song;
  },
);

export const getPlaylist = createAsyncThunk<Playlist | undefined, string>(
  "playlists/getPlaylist",
  async (playlistId: string, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from("playlist")
      .select("id, name, user_id, created_at, songs:song( *, author ( * ) )")
      .eq("id", playlistId);

    if (error) {
      return rejectWithValue(error.message);
    }

    if (data?.length === 0) {
      return rejectWithValue("There is no such playlist");
    }

    return data?.at(0) as Playlist | undefined;
  },
);

export const getUserPlaylists = createAsyncThunk<Playlist[], string>(
  "playlists/getUserPlaylists",
  async (userId: string, { rejectWithValue }) => {
    const { data: response } = await supabase.auth.getSession();

    if (!response.session && userId.length === 0) throw new Error();

    const { data, error } = await supabase
      .from("playlist")
      .select("id, name, user_id, created_at, songs:song( *, author ( * ) )")
      .eq("user_id", userId.length !== 0 ? userId : response.session?.user.id ?? "");

    if (error) {
      return rejectWithValue(error.message);
    }

    if (!data) {
      return [];
    }

    return data as Playlist[];
  },
);

export const {
  filterOutSong,
  filterOutPlaylist,
  addPlaylistToCurrentFetched,
  addSongToPlaylist,
  removeSongFromSelectedPlaylist,
  addSongToSelectedPlaylist,
} = playlistsSlice.actions;

export default playlistsSlice.reducer;
