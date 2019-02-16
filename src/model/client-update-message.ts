import { Message } from './message';

export enum PlaybackState {
    NONE,
    LOADING,
    PLAYING,
    PAUSED,
    STOPPED,
    ENDED,
    SEEKING,
    NULL,
    WAITING,
    STALLED,
    COMPLETED
}

export class ClientUpdateMessage extends Message {
    private currentPlaybackTime: number;
    private currentPlaybackDuration: number;
    private currentPlaybackState: PlaybackState;

    constructor(message) {
        super(message);
        this.currentPlaybackTime = message.currentPlaybackTime;
        this.currentPlaybackDuration = message.currentPlaybackDuration;
        this.currentPlaybackState = message.currentPlaybackState;
    }

    public getCurrentPlaybackTime(): number {
        return this.currentPlaybackTime;
    }

    public getCurrentPlaybackDuration(): number {
        return this.currentPlaybackDuration;
    }

    public getCurrentPlaybackState(): PlaybackState {
        return this.currentPlaybackState;
    }
}