import { useContextSelector } from "use-context-selector";
import { NetworkContext } from "../contexts/network/networkContext";

export const useMessagesWith = (params: { commitId: string; callback: () => void }) => {
  const sendMessage = useContextSelector(NetworkContext, data => data.sendMessage);

  return sendMessage;
}
