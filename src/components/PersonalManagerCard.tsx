import { motion } from "framer-motion";
import { MessageCircle, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssignedManager } from "@/hooks/usePersonalManager";
import { Skeleton } from "@/components/ui/skeleton";

export const PersonalManagerCard = () => {
  const { data: manager, isLoading } = useAssignedManager();

  if (isLoading) {
    return (
      <div className="glass-card p-4">
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!manager) return null;

  const handleWhatsAppContact = () => {
    // Format phone number for WhatsApp
    let phoneNumber = manager.whatsapp_number.replace(/\D/g, "");
    if (phoneNumber.startsWith("0")) {
      phoneNumber = "254" + phoneNumber.slice(1);
    } else if (!phoneNumber.startsWith("254")) {
      phoneNumber = "254" + phoneNumber;
    }
    
    const message = encodeURIComponent(
      manager.welcome_message || `Hello ${manager.name}, I need assistance with my InvesterMate account.`
    );
    
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-trust flex items-center justify-center text-primary-foreground font-bold text-xl">
          <User className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Your Personal Manager</p>
          <h3 className="font-semibold text-lg">{manager.name}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="w-3 h-3" />
            <span>{manager.whatsapp_number}</span>
          </div>
        </div>
        <Button
          onClick={handleWhatsAppContact}
          className="bg-[#25D366] hover:bg-[#128C7E] text-white"
          size="sm"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          Chat
        </Button>
      </div>
    </motion.div>
  );
};
