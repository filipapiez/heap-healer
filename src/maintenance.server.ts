type MaintenanceResult = {
  ok: boolean;
  gsc: unknown;
  semrush: unknown;
  websiteJobs: unknown;
  directoryQueue: unknown;
  dailyPages: unknown;
  aiVisibility: unknown;
  errors: Array<{ task: string; message: string }>;
};


export async function runScheduledMaintenance(_now = new Date()): Promise<MaintenanceResult> {
  const tasks: Array<[string, Promise<unknown>]> = [
    ["gsc", import("./lib/gsc-sync.server").then(({ syncAllGscClients }) => syncAllGscClients())],
    [
      "semrush",
      import("./lib/semrush-sync.server").then(({ syncAllSemrushClients }) =>
        syncAllSemrushClients(),
      ),
    ],
    [
      "websiteJobs",
      import("./lib/website-publish.server").then(({ processWebsitePublishJobs }) =>
        processWebsitePublishJobs(),
      ),
    ],
    // Daily SEO page generation runs every day, independent of the directory queue.
    [
      "dailyPages",
      import("./lib/daily-page-generator.server").then(({ runDailyPageGeneration }) =>
        runDailyPageGeneration(),
      ),
    ],
    [
      "directoryQueue",
      import("./lib/directory-submit.server").then(({ queueWeeklyDirectories }) =>
        queueWeeklyDirectories(),
      ),
    ],
    [
      "aiVisibility",
      import("./lib/ai-visibility.server").then(({ runAiVisibilityChecks }) =>
        runAiVisibilityChecks(),
      ),
    ],
    [
      "backlinkVerify",
      import("./lib/backlink-verify.server").then(({ verifyDirectoryBacklinks }) =>
        verifyDirectoryBacklinks(),
      ),
    ],
  ];


  const settled = await Promise.allSettled(tasks.map(([, task]) => task));
  const output: MaintenanceResult = {
    ok: true,
    gsc: null,
    semrush: null,
    websiteJobs: null,
    directoryQueue: null,
    dailyPages: null,
    aiVisibility: null,
    errors: [],
  };
  settled.forEach((result, index) => {
    const task = tasks[index][0] as
      | "gsc"
      | "semrush"
      | "websiteJobs"
      | "directoryQueue"
      | "dailyPages"
      | "aiVisibility";

    if (result.status === "fulfilled") {
      output[task] = result.value;
    } else {
      output.ok = false;
      output.errors.push({
        task,
        message: result.reason instanceof Error ? result.reason.message : String(result.reason),
      });
    }
  });
  return output;
}
