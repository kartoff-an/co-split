import { invalidateAfterMembershipMutation } from '@/api/queryInvalidation';
import * as workspaceService from '@/services/workspaceService';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseWorkspaceInviteOptions {
  workspaceId: string;
  inviteCode: string | null;
  enabled: boolean;
}

export const useWorkspaceInvite = ({ workspaceId, inviteCode, enabled }: UseWorkspaceInviteOptions) => {
  const queryClient = useQueryClient();
  const attemptedKeyRef = useRef<string | null>(null);

  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinedKey, setJoinedKey] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const attemptKey = workspaceId && inviteCode;

  useEffect(() => {
    if (!enabled || !attemptKey || !inviteCode) {
      return;
    }

    // this prevents duplicate requests
    if (attemptedKeyRef.current === attemptKey) {
      return;
    }

    attemptedKeyRef.current = attemptKey;

    const performJoin = async () => {
      setJoining(true);
      setJoinError(null);

      try {
        await workspaceService.joinWorkspaceWithCode(inviteCode);
        await invalidateAfterMembershipMutation(queryClient, workspaceId);

        setJoinedKey(attemptKey);
      } catch (err) {
        setJoinError(err instanceof Error ? err.message : 'Invalid or expired invite link.');
      } finally {
        setJoining(false);
      }
    };

    void performJoin();
  }, [enabled, attemptKey, inviteCode, workspaceId, queryClient, retryCount]);

  const retry = useCallback(() => {
    if (!attemptKey) {
      return;
    }

    attemptedKeyRef.current = null;
    setJoinError(null);
    setRetryCount((current) => current + 1);
  }, [attemptKey]);

  return {
    joining,
    joinError,
    joined: joinedKey === attemptKey,
    retry,
  };
};
