import { useContextSelector } from "use-context-selector";
import { NetworkContext } from "../contexts/network/networkContext";
import { useEffect } from "react";

export const useMessagesWith = (params: { commitId: string; callback: (msg: unknown) => void }) => {
  const sendMessage = useContextSelector(NetworkContext, data => data.sendMessage);
  const listenForMessagesWith = useContextSelector(NetworkContext, data => data.listenForMessagesWith);

  useEffect(() => {
    listenForMessagesWith(params)
  }, []);

  return sendMessage;
}
