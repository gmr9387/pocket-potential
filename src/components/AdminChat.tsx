import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatThread {
  user_id: string;
  user_email: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  is_from_admin: boolean;
  created_at: string;
}

const AdminChat = () => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchThreads();

    const channel = supabase
      .channel("admin-chat-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        () => {
          fetchThreads();
          if (selectedThread) {
            fetchMessages(selectedThread);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedThread]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchThreads = async () => {
    // Get unique users with their latest message
    const { data: chatData, error } = await supabase
      .from("chat_messages")
      .select("user_id, message, created_at, is_read, is_from_admin")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching threads:", error);
      return;
    }

    // Group by user_id and get latest message
    const threadMap = new Map<string, ChatThread>();
    
    for (const msg of chatData || []) {
      if (!threadMap.has(msg.user_id)) {
        // Get user email from profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", msg.user_id)
          .single();

        threadMap.set(msg.user_id, {
          user_id: msg.user_id,
          user_email: profile?.email || "Unknown User",
          last_message: msg.message,
          last_message_time: msg.created_at,
          unread_count: 0,
        });
      }

      // Count unread messages (from user, not admin)
      if (!msg.is_read && !msg.is_from_admin) {
        const thread = threadMap.get(msg.user_id)!;
        thread.unread_count++;
      }
    }

    setThreads(Array.from(threadMap.values()));
  };

  const fetchMessages = async (userId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(data || []);

    // Mark messages as read
    await supabase
      .from("chat_messages")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_from_admin", false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("chat_messages").insert({
      user_id: selectedThread,
      admin_id: user.id,
      message: newMessage.trim(),
      is_from_admin: true,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return;
    }

    setNewMessage("");
  };

  const selectThread = (userId: string) => {
    setSelectedThread(userId);
    fetchMessages(userId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Live Chat Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-96">
          {/* Thread List */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-2 font-medium text-sm">Conversations</div>
            <ScrollArea className="h-80">
              {threads.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No conversations yet
                </div>
              ) : (
                threads.map((thread) => (
                  <div
                    key={thread.user_id}
                    onClick={() => selectThread(thread.user_id)}
                    className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedThread === thread.user_id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium truncate max-w-[120px]">
                          {thread.user_email}
                        </span>
                      </div>
                      {thread.unread_count > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {thread.unread_count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {thread.last_message}
                    </p>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 border rounded-lg flex flex-col">
            {selectedThread ? (
              <>
                <ScrollArea className="flex-1 p-3" ref={scrollRef}>
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.is_from_admin ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                            msg.is_from_admin
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p>{msg.message}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              msg.is_from_admin
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-3 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a reply..."
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p className="text-sm">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminChat;
