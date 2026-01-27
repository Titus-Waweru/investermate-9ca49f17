import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useInvestments } from "./useInvestments";
import { useWallet } from "./useWallet";
import { api } from "@/lib/api";
import { useToast } from "./use-toast";
import confetti from "canvas-confetti";

interface MaturedInvestment {
  id: string;
  amount: number;
  expected_return: number;
  product_name?: string;
}

export const useInvestmentMaturation = () => {
  const { user } = useAuth();
  const { data: investments, refetch: refetchInvestments } = useInvestments();
  const { data: wallet } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

  const celebrateMaturation = useCallback((maturedInvestments: MaturedInvestment[]) => {
    // Trigger confetti celebration
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });

    // Show toast for each matured investment
    const totalReturns = maturedInvestments.reduce((sum, inv) => sum + inv.expected_return, 0);
    const totalProfit = maturedInvestments.reduce((sum, inv) => sum + (inv.expected_return - inv.amount), 0);

    toast({
      title: "🎉 Congratulations! Investment Matured!",
      description: `Your investment has matured! KES ${totalReturns.toLocaleString()} (profit: +KES ${totalProfit.toLocaleString()}) has been added to your wallet!`,
      duration: 10000,
    });
  }, [toast]);

  const processMaturedInvestments = useCallback(async () => {
    if (!user || !investments || !wallet || isProcessing) return;

    const now = new Date();
    const maturedActive = investments.filter(
      (inv) =>
        inv.status === "active" &&
        new Date(inv.matures_at) <= now &&
        !processedIds.has(inv.id)
    );

    if (maturedActive.length === 0) return;

    setIsProcessing(true);

    try {
      const maturedData: MaturedInvestment[] = [];
      let totalReturns = 0;
      let totalPendingReturnsDeduction = 0;

      for (const investment of maturedActive) {
        // Mark as processed immediately to prevent duplicate processing
        setProcessedIds((prev) => new Set([...prev, investment.id]));

        const profit = Number(investment.expected_return) - Number(investment.amount);
        totalReturns += Number(investment.expected_return);
        totalPendingReturnsDeduction += profit;

        maturedData.push({
          id: investment.id,
          amount: Number(investment.amount),
          expected_return: Number(investment.expected_return),
          product_name: investment.products?.name,
        });
      }

      // Call API to process matured investments
      await api.investments.mature(maturedActive.map(inv => inv.id));

      // Celebrate!
      celebrateMaturation(maturedData);

      // Refresh data
      await Promise.all([
        refetchInvestments(),
        queryClient.invalidateQueries({ queryKey: ["wallet", user.id] }),
        queryClient.invalidateQueries({ queryKey: ["transactions", user.id] }),
      ]);
    } catch (error) {
      console.error("Failed to process matured investments:", error);
      // Remove from processed set so it can be retried
      maturedActive.forEach((inv) => {
        setProcessedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(inv.id);
          return newSet;
        });
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user, investments, wallet, isProcessing, processedIds, celebrateMaturation, refetchInvestments, queryClient]);

  // Check for matured investments periodically
  useEffect(() => {
    if (!user || !investments) return;

    // Initial check
    processMaturedInvestments();

    // Check every 30 seconds
    const interval = setInterval(processMaturedInvestments, 30000);

    return () => clearInterval(interval);
  }, [user?.id, investments?.length, processMaturedInvestments]);

  return { isProcessing, processedIds };
};
