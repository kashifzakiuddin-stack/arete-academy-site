/*
  Server-side assembly of everything a dashboard needs for one child.
  All reads go through the CALLER'S client, so Row Level Security
  decides what this request may see — a parent gets their own child or
  nothing; a tutor gets assigned pupils or nothing.
*/

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  effectiveMastery,
  masteryBand,
  masterySeries,
  type Confidence,
  type MasteryBand,
} from "./mastery";

export interface SkillDashboardRow {
  skillId: string;
  code: string;
  name: string;
  category: "essential" | "extension";
  attemptsCount: number;
  correctCount: number;
  effective: number | null; // null = not started
  band: MasteryBand | null;
  lastAttemptAt: Date | null;
  series: Array<{ at: Date; mastery: number }>;
}

export interface SessionSummary {
  id: string;
  startedAt: Date;
  skillName: string;
  answered: number;
  correct: number;
}

export interface MisconceptionSummary {
  label: string;
  count: number;
}

export interface ChildDashboardData {
  child: { id: string; firstName: string; yearGroup: string };
  skills: SkillDashboardRow[];
  sessions: SessionSummary[];
  recentMisconceptions: MisconceptionSummary[];
  totalAttempts: number;
}

const MISCONCEPTION_WINDOW_DAYS = 30;

export async function loadChildDashboard(
  userClient: SupabaseClient,
  childId: string,
  now: Date = new Date()
): Promise<ChildDashboardData | null> {
  const { data: child } = await userClient
    .from("children")
    .select("id, first_name, year_group")
    .eq("id", childId)
    .maybeSingle();
  if (!child) return null; // RLS said no (or the child does not exist)

  const [{ data: skills }, { data: masteryRows }, { data: attempts }, { data: sessions }] =
    await Promise.all([
      userClient
        .from("skills")
        .select("id, code, name, category")
        .eq("subject_id", "maths")
        .eq("active", true)
        .order("sort_order"),
      userClient
        .from("skill_mastery")
        .select("skill_id, mastery, attempts_count, correct_count, last_attempt_at")
        .eq("child_id", childId),
      userClient
        .from("question_attempts")
        .select(
          "session_id, skill_id, selected_option_id, is_correct, confidence, misconception_id, created_at"
        )
        .eq("child_id", childId)
        .order("created_at", { ascending: true }),
      userClient
        .from("quiz_sessions")
        .select("id, skill_id, created_at")
        .eq("child_id", childId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const allAttempts = attempts ?? [];
  const masteryBySkill = new Map(
    (masteryRows ?? []).map((row) => [row.skill_id, row])
  );
  const attemptsBySkill = new Map<string, typeof allAttempts>();
  for (const attempt of allAttempts) {
    const list = attemptsBySkill.get(attempt.skill_id) ?? [];
    list.push(attempt);
    attemptsBySkill.set(attempt.skill_id, list);
  }

  const skillRows: SkillDashboardRow[] = (skills ?? []).map((skill) => {
    const mastery = masteryBySkill.get(skill.id);
    const skillAttempts = attemptsBySkill.get(skill.id) ?? [];
    const lastAttemptAt = mastery ? new Date(mastery.last_attempt_at) : null;
    const effective =
      mastery && lastAttemptAt
        ? effectiveMastery(mastery.mastery, lastAttemptAt, now)
        : null;
    return {
      skillId: skill.id,
      code: skill.code,
      name: skill.name,
      category: skill.category as "essential" | "extension",
      attemptsCount: mastery?.attempts_count ?? 0,
      correctCount: mastery?.correct_count ?? 0,
      effective,
      band: effective === null ? null : masteryBand(effective),
      lastAttemptAt,
      series: masterySeries(
        skillAttempts.map((a) => ({
          createdAt: new Date(a.created_at),
          answered: a.selected_option_id !== null,
          correct: a.is_correct,
          confidence: (a.confidence ?? null) as Confidence | null,
        }))
      ),
    };
  });

  // Recent misconception counts, labelled.
  const windowStart = now.getTime() - MISCONCEPTION_WINDOW_DAYS * 86400000;
  const misconceptionCounts = new Map<string, number>();
  for (const attempt of allAttempts) {
    if (!attempt.misconception_id) continue;
    if (new Date(attempt.created_at).getTime() < windowStart) continue;
    misconceptionCounts.set(
      attempt.misconception_id,
      (misconceptionCounts.get(attempt.misconception_id) ?? 0) + 1
    );
  }
  let recentMisconceptions: MisconceptionSummary[] = [];
  if (misconceptionCounts.size > 0) {
    const { data: labels } = await userClient
      .from("misconceptions")
      .select("id, label")
      .in("id", [...misconceptionCounts.keys()]);
    recentMisconceptions = (labels ?? [])
      .map((row) => ({
        label: row.label,
        count: misconceptionCounts.get(row.id) ?? 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  const skillNameById = new Map((skills ?? []).map((s) => [s.id, s.name]));
  const sessionSummaries: SessionSummary[] = (sessions ?? []).map((session) => {
    const sessionAttempts = allAttempts.filter((a) => a.session_id === session.id);
    return {
      id: session.id,
      startedAt: new Date(session.created_at),
      skillName: skillNameById.get(session.skill_id) ?? "—",
      answered: sessionAttempts.length,
      correct: sessionAttempts.filter((a) => a.is_correct).length,
    };
  });

  return {
    child: {
      id: child.id,
      firstName: child.first_name,
      yearGroup: child.year_group,
    },
    skills: skillRows,
    sessions: sessionSummaries,
    recentMisconceptions,
    totalAttempts: allAttempts.length,
  };
}
