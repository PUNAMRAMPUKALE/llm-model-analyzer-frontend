"use client";
import { useExperiments } from "@/services/api";

export function useHasExperiments() {
  const { data = [], isLoading } = useExperiments({ enabled: true });
  return { hasAny: (data?.length ?? 0) > 0, isLoading };
}