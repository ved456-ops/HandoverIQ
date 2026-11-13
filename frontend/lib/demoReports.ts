import type { HandoverReport, ReportSummary } from "./api";

export const DEMO_HELLO_WORLD: HandoverReport = {
  report_id: "2dce427d-3752-466e-8766-160e405eff22",
  repository_url: "https://github.com/octocat/Hello-World",
  repo_name: "octocat/Hello-World",
  generated_at: "2026-11-09T08:03:55.605281Z",
  generator: "evidence-synthesizer (deterministic engine)",
  executive_summary:
    "Handover report for octocat/Hello-World (General). Analyzed 3 recent commits across 3 contributors, 30 pull requests, and 19 issues.",
  readiness: {
    overall: 68,
    band: "ready",
    bus_factor: 100,
    hygiene: 100,
    clarity: 67,
    gap_resolution: 33,
    facts: {
      top_owner: "octocat",
      top_owner_share: 0.33,
      contributors: 3,
      commits_sampled: 3,
      stale_open_prs: 0,
      open_bugs: 0,
      gaps_resolved: 1,
      gaps_total: 3,
    },
  },
  ownership: {
    title: "Ownership & Core Modules",
    summary: "Key code ownership is concentrated across 3 active contributors.",
    insights: [
      {
        title: "Primary Contributor: octocat",
        description:
          "octocat authored 1 of the last 3 commits analyzed, indicating deep code ownership.",
        impact: "info",
        evidence: [
          {
            type: "commit",
            identifier: "7fd1a60",
            title: "Merge pull request #6 from Spaceghost/patch-1",
            url: "https://github.com/octocat/Hello-World/commit/7fd1a60b01f91b314f59955a4e4d4e80d8edf11d",
            snippet: null,
          },
        ],
      },
      {
        title: "Primary Contributor: Spaceghost",
        description:
          "Spaceghost authored 1 of the last 3 commits analyzed, indicating deep code ownership.",
        impact: "info",
        evidence: [
          {
            type: "commit",
            identifier: "7629413",
            title: "New line at end of file. --Signed off by Spaceghost",
            url: "https://github.com/octocat/Hello-World/commit/762941318ee16e59dabbacb1b4049eec22f0d303",
            snippet: null,
          },
        ],
      },
      {
        title: "Primary Contributor: Cameron423698",
        description:
          "Cameron423698 authored 1 of the last 3 commits analyzed, indicating deep code ownership.",
        impact: "info",
        evidence: [
          {
            type: "commit",
            identifier: "553c207",
            title: "first commit",
            url: "https://github.com/octocat/Hello-World/commit/553c2077f0edc3d5dc5d17262f6aa498e69d6f8e",
            snippet: null,
          },
        ],
      },
    ],
  },
  unfinished_work: {
    title: "Unfinished Work & In-Flight Tasks",
    summary:
      "Identified 18 open pull requests and 14 open issues requiring resolution or status check.",
    insights: [
      {
        title: "Open Pull Request #11715: Update Hello World to Thai language",
        description:
          "In-progress pull request by bosssnkc. Review or merge status is required during transition.",
        impact: "high",
        evidence: [
          {
            type: "pull_request",
            identifier: "#11715",
            title: "Update Hello World to Thai language",
            url: "https://github.com/octocat/Hello-World/pull/11715",
            snippet: null,
          },
        ],
      },
      {
        title: "Open Pull Request #11677: Experiment 25 Contribution",
        description:
          "In-progress pull request by Priyavarsheni. Review or merge status is required during transition.",
        impact: "high",
        evidence: [
          {
            type: "pull_request",
            identifier: "#11677",
            title: "Experiment 25 Contribution",
            url: "https://github.com/octocat/Hello-World/pull/11677",
            snippet: null,
          },
        ],
      },
      {
        title: "Open Pull Request #123: Spanish",
        description:
          "In-progress pull request by Shature. Review or merge status is required during transition.",
        impact: "high",
        evidence: [
          {
            type: "pull_request",
            identifier: "#123",
            title: "Spanish",
            url: "https://github.com/octocat/Hello-World/pull/123",
            snippet: null,
          },
        ],
      },
      {
        title: "Active Issue #11714: test",
        description:
          "Open issue with 0 comments. Review to determine if this blocks incoming handover deliverables.",
        impact: "medium",
        evidence: [
          {
            type: "issue",
            identifier: "#11714",
            title: "test",
            url: "https://github.com/octocat/Hello-World/issues/11714",
            snippet: null,
          },
        ],
      },
    ],
  },
  architectural_decisions: {
    title: "Architectural Decisions & Context",
    summary:
      "Recent major architectural modifications and functional enhancements extracted from commit history.",
    insights: [
      {
        title:
          "Recent Development: Merge pull request #6 from Spaceghost/patch-1",
        description: "Baseline commit establishing current operational state.",
        impact: "info",
        evidence: [
          {
            type: "commit",
            identifier: "7fd1a60",
            title: "Merge pull request #6 from Spaceghost/patch-1",
            url: "https://github.com/octocat/Hello-World/commit/7fd1a60b01f91b314f59955a4e4d4e80d8edf11d",
            snippet: null,
          },
        ],
      },
    ],
  },
  dependencies_and_setup: {
    title: "Dependencies & Setup Context",
    summary: "Core technologies configured around multi-language environment.",
    insights: [
      {
        title: "Primary Ecosystem: Multi-language",
        description:
          "Repository primary stack is custom. Default development branch is 'master'.",
        impact: "info",
        evidence: [
          {
            type: "file",
            identifier: "repo-spec",
            title: "octocat/Hello-World metadata",
            url: "https://github.com/octocat/Hello-World",
            snippet: null,
          },
        ],
      },
    ],
  },
  risks_and_debt: {
    title: "Risks, Tech Debt & Blockers",
    summary:
      "Identified potential handover risks, single points of failure, and active bug reports.",
    insights: [],
  },
  knowledge_gaps: [
    {
      id: "custom-gap-1aeea0",
      category: "credentials",
      title: "Where is the API deployment key?",
      description: "Need to clarify secret rotation before offboarding.",
      suggested_action: "Add key to 1Password vault.",
      resolved: false,
      evidence: [],
    },
    {
      id: "gap-6a0939",
      category: "operations",
      title: "Deployment Pipeline & Credential Access Verification",
      description:
        "Verify environment variables, deployment secrets, and production release access before developer departure.",
      suggested_action:
        "Schedule a 30-minute credentials and release pipeline handover session.",
      resolved: true,
      evidence: [],
    },
    {
      id: "gap-549894",
      category: "architecture",
      title: "Unwritten Architectural Tradeoffs",
      description:
        "Check if undocumented assumptions exist behind recent pull requests and commits.",
      suggested_action:
        "Request departing maintainer to annotate key PRs or document top 3 architectural caveats.",
      resolved: false,
      evidence: [],
    },
  ],
};

export const DEMO_FLASK: HandoverReport = {
  report_id: "b30436d5-d236-45ab-908e-a22a79e111fa",
  repository_url: "https://github.com/pallets/flask",
  repo_name: "pallets/flask",
  generated_at: "2026-11-09T08:28:33.423077Z",
  generator: "evidence-synthesizer (deterministic engine)",
  executive_summary:
    "Handover report for pallets/flask (Python). Analyzed 30 recent commits across 3 contributors, 30 pull requests, and 18 issues.",
  readiness: {
    overall: 74,
    band: "ready",
    bus_factor: 55,
    hygiene: 85,
    clarity: 90,
    gap_resolution: 50,
    facts: {
      top_owner: "davidism",
      top_owner_share: 0.9,
      contributors: 3,
      commits_sampled: 30,
      stale_open_prs: 0,
      open_bugs: 0,
      gaps_resolved: 0,
      gaps_total: 2,
    },
  },
  ownership: {
    title: "Ownership & Core Modules",
    summary: "Key code ownership is concentrated across 3 active contributors.",
    insights: [
      {
        title: "Primary Contributor: davidism",
        description:
          "davidism authored 27 of the last 30 commits analyzed, indicating deep code ownership.",
        impact: "info",
        evidence: [
          {
            type: "commit",
            identifier: "49943b5",
            title: "add `versionchanged` for ctx signature change (#6176)",
            url: "https://github.com/pallets/flask/commit/49943b5a94413a530761350f04e896f76e8d620e",
            snippet: null,
          },
          {
            type: "commit",
            identifier: "bfc8f98",
            title: "add `versionchanged` for ctx signature change",
            url: "https://github.com/pallets/flask/commit/bfc8f983871dcadf0492578d9ab72d951b34c19c",
            snippet: null,
          },
          {
            type: "commit",
            identifier: "d04a0c1",
            title: "fix example typo",
            url: "https://github.com/pallets/flask/commit/d04a0c15a83c78186cf31dc5d226b3110321b9e5",
            snippet: null,
          },
        ],
      },
      {
        title: "Primary Contributor: lkk7",
        description:
          "lkk7 authored 2 of the last 30 commits analyzed, indicating deep code ownership.",
        impact: "info",
        evidence: [
          {
            type: "commit",
            identifier: "7203fea",
            title: "Fix IPv6 server name parsing",
            url: "https://github.com/pallets/flask/commit/7203feabf723edae0286ae5dc64fec8ac4c91735",
            snippet: null,
          },
        ],
      },
    ],
  },
  unfinished_work: {
    title: "Unfinished Work & In-Flight Tasks",
    summary:
      "Identified 2 open pull requests and 1 open issue requiring resolution or status check.",
    insights: [
      {
        title: "Open Pull Request #5918: automatic options as separate route",
        description:
          "In-progress pull request by davidism. Review or merge status is required during transition.",
        impact: "high",
        evidence: [
          {
            type: "pull_request",
            identifier: "#5918",
            title: "automatic options as separate route",
            url: "https://github.com/pallets/flask/pull/5918",
            snippet: null,
          },
        ],
      },
      {
        title:
          "Active Issue #6146: Add Cloudflare to Flask Hosting Platforms docs?",
        description:
          "Open issue with 4 comments. Review to determine if this blocks incoming handover deliverables.",
        impact: "medium",
        evidence: [
          {
            type: "issue",
            identifier: "#6146",
            title: "Add Cloudflare to Flask Hosting Platforms docs?",
            url: "https://github.com/pallets/flask/issues/6146",
            snippet: null,
          },
        ],
      },
    ],
  },
  architectural_decisions: {
    title: "Architectural Decisions & Context",
    summary:
      "Recent major architectural modifications and functional enhancements extracted from commit history.",
    insights: [
      {
        title: "Decision Context: drop support for Python 3.10 (#6168)",
        description:
          "Significant code modification recorded in commit history: 'drop support for Python 3.10 (#6168)'.",
        impact: "info",
        evidence: [
          {
            type: "commit",
            identifier: "728c5e4",
            title: "drop support for Python 3.10 (#6168)",
            url: "https://github.com/pallets/flask/commit/728c5e440af704a786384159184f695cf04ecbe7",
            snippet: null,
          },
        ],
      },
    ],
  },
  dependencies_and_setup: {
    title: "Dependencies & Setup Context",
    summary: "Core technologies configured around Python environment.",
    insights: [
      {
        title: "Primary Ecosystem: Python",
        description:
          "Repository primary stack is Python. Default development branch is 'main'.",
        impact: "info",
        evidence: [
          {
            type: "file",
            identifier: "repo-spec",
            title: "pallets/flask metadata",
            url: "https://github.com/pallets/flask",
            snippet: null,
          },
        ],
      },
    ],
  },
  risks_and_debt: {
    title: "Risks, Tech Debt & Blockers",
    summary:
      "Identified potential handover risks, single points of failure, and active bug reports.",
    insights: [],
  },
  knowledge_gaps: [
    {
      id: "gap-0baed5",
      category: "operations",
      title: "Deployment Pipeline & Credential Access Verification",
      description:
        "Verify environment variables, deployment secrets, and production release access before developer departure.",
      suggested_action:
        "Schedule a 30-minute credentials and release pipeline handover session.",
      resolved: false,
      evidence: [],
    },
    {
      id: "gap-48a2f4",
      category: "architecture",
      title: "Unwritten Architectural Tradeoffs",
      description:
        "Check if undocumented assumptions exist behind recent pull requests and commits.",
      suggested_action:
        "Request departing maintainer to annotate key PRs or document top 3 architectural caveats.",
      resolved: false,
      evidence: [],
    },
  ],
};

const DEMO_STORE: Record<string, HandoverReport> = {
  [DEMO_HELLO_WORLD.report_id]: DEMO_HELLO_WORLD,
  "octocat/Hello-World": DEMO_HELLO_WORLD,
  "https://github.com/octocat/Hello-World": DEMO_HELLO_WORLD,
  [DEMO_FLASK.report_id]: DEMO_FLASK,
  "pallets/flask": DEMO_FLASK,
  "https://github.com/pallets/flask": DEMO_FLASK,
};

export function getOfflineDemoReport(key: string): HandoverReport | null {
  if (!key) return null;
  const clean = key.trim().toLowerCase();
  for (const [k, report] of Object.entries(DEMO_STORE)) {
    if (k.toLowerCase() === clean) return report;
  }
  return null;
}

export function getOfflineReportSummaries(): ReportSummary[] {
  return [
    {
      report_id: DEMO_HELLO_WORLD.report_id,
      repo_name: DEMO_HELLO_WORLD.repo_name,
      repository_url: DEMO_HELLO_WORLD.repository_url,
      generated_at: DEMO_HELLO_WORLD.generated_at,
      generator: DEMO_HELLO_WORLD.generator,
      unresolved_gaps: DEMO_HELLO_WORLD.knowledge_gaps.filter((g) => !g.resolved)
        .length,
      insights_count: 11,
    },
    {
      report_id: DEMO_FLASK.report_id,
      repo_name: DEMO_FLASK.repo_name,
      repository_url: DEMO_FLASK.repository_url,
      generated_at: DEMO_FLASK.generated_at,
      generator: DEMO_FLASK.generator,
      unresolved_gaps: DEMO_FLASK.knowledge_gaps.filter((g) => !g.resolved)
        .length,
      insights_count: 7,
    },
  ];
}
