import NavBarDB from "../../NavBarDB";
import BackButton from "../../../BackButton";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { GetChatMessages, GetConversations } from "../../../../redux/actions";
import ConversationsTable from "./ConversationsTable";
import DeleteOldMessages from "./DeleteOldMessages";

export default function Chats() {
  document.title = "Conversaciones - Jardin Luceritos";
  const conversations = useSelector((state) => state.conversations);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(GetChatMessages());
    dispatch(GetConversations());
  }, [dispatch]);

  return (
    <div className="watermark-background">
      <NavBarDB />
      <div className="container" style={{ marginTop: "100px" }}>
        <div className="d-flex gap-3 mb-4">
          <BackButton />
          <DeleteOldMessages />
        </div>
        <h2 className="text-center module-title">Conversaciones</h2>
        <ConversationsTable conversations={conversations} />
      </div>
    </div>
  );
}
