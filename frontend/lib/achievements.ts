"use client";

export type BadgeId =
  | "first_dossier"
  | "gap_crusher"
  | "pdf_publisher"
  | "repo_curator"
  | "tour_graduate"
  | "benchmark_analyst"
  | "profile_complete"
  | "multi_pillar_master";

export type Badge = {
  id: BadgeId;
  name: string;
  icon: string;
  category: "Discovery" | "Audit" | "Resolution" | "Mastery";
  description: string;
  xp: number;
};

export const ALL_BADGES: Record<BadgeId, Badge> = {
  first_dossier: {
    id: "first_dossier",
    name: "Zero-Hallucination Pioneer",
    icon: "🛡️",
    category: "Audit",
    description: "Synthesized your first evidence-linked 5-pillar handover dossier.",
    xp: 50,
  },
  gap_crusher: {
    id: "gap_crusher",
    name: "Debt & Gap Buster",
    icon: "🧹",
    category: "Resolution",
    description: "Marked an unresolved engineering handover gap as resolved.",
    xp: 40,
  },
  pdf_publisher: {
    id: "pdf_publisher",
    name: "Executive Publisher",
    icon: "🖨️",
    category: "Mastery",
    description: "Exported or printed an official A4 engineering transition dossier.",
    xp: 35,
  },
  repo_curator: {
    id: "repo_curator",
    name: "Repository Curator",
    icon: "📌",
    category: "Discovery",
    description: "Bookmarked a critical repository for ongoing handover readiness.",
    xp: 30,
  },
  tour_graduate: {
    id: "tour_graduate",
    name: "Archon's Apprentice",
    icon: "🧙",
    category: "Discovery",
    description: "Completed Archon's 5-step interactive Hackathon tour.",
    xp: 25,
  },
  benchmark_analyst: {
    id: "benchmark_analyst",
    name: "Readiness Benchmark Analyst",
    icon: "⚖️",
    category: "Audit",
    description: "Evaluated side-by-side transition risks in the Comparison Matrix.",
    xp: 30,
  },
  profile_complete: {
    id: "profile_complete",
    name: "Verified Engineer Identity",
    icon: "👤",
    category: "Discovery",
    description: "Uploaded an engineering profile photo or customized team bio.",
    xp: 25,
  },
  multi_pillar_master: {
    id: "multi_pillar_master",
    name: "Staff Transition Architect",
    icon: "👑",
    category: "Mastery",
    description: "Mastered 3+ repository audits and eliminated critical bus-factor risks.",
    xp: 100,
  },
};

export type UserRank = {
  level: number;
  title: string;
  badge: string;
  minXp: number;
  maxXp: number;
  color: string;
};

export const RANKS: UserRank[] = [
  {
    level: 1,
    title: "Cadet Explorer",
    badge: "🧭",
    minXp: 0,
    maxXp: 50,
    color: "#6B7280",
  },
  {
    level: 2,
    title: "Repository Scout",
    badge: "🔍",
    minXp: 50,
    maxXp: 110,
    color: "#3B82F6",
  },
  {
    level: 3,
    title: "Debt Buster",
    badge: "🛡️",
    minXp: 110,
    maxXp: 180,
    color: "#10B981",
  },
  {
    level: 4,
    title: "Bus-Factor Guardian",
    badge: "⚔️",
    minXp: 180,
    maxXp: 260,
    color: "#8B5CF6",
  },
  {
    level: 5,
    title: "Staff Handover Architect",
    badge: "👑",
    minXp: 260,
    maxXp: 350,
    color: "#F59E0B",
  },
];

const STORAGE_KEY = "handoveriq_unlocked_badges";

export type UnlockedBadgeRecord = {
  id: BadgeId;
  unlockedAt: string;
};

export function getUnlockedBadges(): UnlockedBadgeRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getTotalXp(): number {
  const unlocked = getUnlockedBadges();
  return unlocked.reduce((acc, curr) => {
    const b = ALL_BADGES[curr.id];
    return acc + (b ? b.xp : 0);
  }, 0);
}

export function getCurrentRank(): { rank: UserRank; nextRank: UserRank | null; progress: number } {
  const xp = getTotalXp();
  let rank = RANKS[0];
  let nextRank: UserRank | null = RANKS[1];

  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXp) {
      rank = RANKS[i];
      nextRank = RANKS[i + 1] || null;
    }
  }

  const range = nextRank ? nextRank.minXp - rank.minXp : 100;
  const currInRange = xp - rank.minXp;
  const progress = nextRank ? Math.min(100, Math.round((currInRange / range) * 100)) : 100;

  return { rank, nextRank, progress };
}

export function unlockBadge(badgeId: BadgeId): boolean {
  if (typeof window === "undefined") return false;
  const current = getUnlockedBadges();
  const exists = current.some((b) => b.id === badgeId);
  if (exists) return false;

  const newRecord: UnlockedBadgeRecord = {
    id: badgeId,
    unlockedAt: new Date().toISOString(),
  };

  const updated = [...current, newRecord];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  const badge = ALL_BADGES[badgeId];
  if (badge) {
    window.dispatchEvent(
      new CustomEvent("handoveriq-badge-unlocked", {
        detail: {
          badge,
          totalXp: getTotalXp(),
          rank: getCurrentRank().rank,
        },
      })
    );
  }

  return true;
}
