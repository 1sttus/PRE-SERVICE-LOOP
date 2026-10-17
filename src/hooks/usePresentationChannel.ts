import { useEffect, useRef, useCallback } from 'react';
import type { PresentationState, SyncMessage } from '../types/presentation.ts';

export const PRESENTATION_CHANNEL_NAME = 'morningstar_preservice_channel';

interface UsePresentationChannelOptions {
  channelName?: string;
  isController?: boolean;
  onStateReceived?: (state: PresentationState) => void;
  onRequestSyncReceived?: () => void;
}

/**
 * Custom hook using BroadcastChannel to synchronize presentation state
 * (currentSceneId, playbackStatus, timeline, etc.) between /display and /control windows.
 */
export function usePresentationChannel({
  channelName = PRESENTATION_CHANNEL_NAME,
  isController = false,
  onStateReceived,
  onRequestSyncReceived,
}: UsePresentationChannelOptions = {}) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Initialize BroadcastChannel
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(channelName);
      channelRef.current = channel;

      channel.onmessage = (event: MessageEvent<SyncMessage>) => {
        const msg = event.data;
        if (!msg) return;

        if (msg.type === 'STATE_SYNC' && msg.payload) {
          onStateReceived?.(msg.payload as PresentationState);
        } else if (msg.type === 'REQUEST_SYNC') {
          onRequestSyncReceived?.();
        }
      };
    } catch (err) {
      console.warn('BroadcastChannel not supported or error:', err);
    }

    // If client/display, request latest state from control room
    if (!isController && channel) {
      try {
        channel.postMessage({
          type: 'REQUEST_SYNC',
          timestamp: Date.now(),
        });
      } catch {
        // ignore
      }
    }

    return () => {
      if (channel) {
        channel.close();
        channelRef.current = null;
      }
    };
  }, [channelName, isController, onStateReceived, onRequestSyncReceived]);

  // Function to broadcast state update to other tabs/windows
  const broadcastState = useCallback((state: PresentationState) => {
    if (channelRef.current) {
      try {
        const message: SyncMessage = {
          type: 'STATE_SYNC',
          payload: state,
          timestamp: Date.now(),
        };
        channelRef.current.postMessage(message);
      } catch (err) {
        console.warn('Failed to broadcast state:', err);
      }
    }
  }, []);

  // Function to send custom sync message
  const postMessage = useCallback((msg: SyncMessage) => {
    if (channelRef.current) {
      try {
        channelRef.current.postMessage(msg);
      } catch (err) {
        console.warn('Failed to post message:', err);
      }
    }
  }, []);

  return {
    broadcastState,
    postMessage,
  };
}
