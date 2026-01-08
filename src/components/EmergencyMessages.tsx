import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { useEmergencyMessages } from "@/hooks/useEmergencyMessages";
import { formatDistanceToNow } from "date-fns";

export const EmergencyMessages = () => {
  const { data: messages } = useEmergencyMessages();
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visibleMessages = messages?.filter((m) => !dismissed.includes(m.id)) || [];

  if (visibleMessages.length === 0) return null;

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {visibleMessages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="glass-card overflow-hidden border-destructive/30"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-destructive truncate">{msg.title}</h4>
                    <button
                      onClick={() => setDismissed((prev) => [...prev, msg.id])}
                      className="p-1 rounded-full hover:bg-muted transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{msg.message}</p>
                  {msg.image_url && (
                    <img
                      src={msg.image_url}
                      alt={msg.title}
                      className="mt-3 rounded-lg max-h-40 object-cover w-full"
                    />
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
