type MaintenanceResult = {
  ok: boolean;
  gsc: unknown;
  semrush: unknown;
  websiteJobs: unknown;
  directoryQueue: unknown;
  errors: Array<{ task: string; message: string }>;
};

export async function runScheduledMaintenance(now = new Date()): Promise<MaintenanceResult> {
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
  ];
  if (now.getUTCDay() === 1) {
    tasks.push([
      "directoryQueue",
      import("./lib/directory-submit.server").then(({ queueWeeklyDirectories }) =>
        queueWeeklyDirectories(),
      ),
    ]);
  }

  const settled = await Promise.allSettled(tasks.map(([, task]) => task));
  const output: MaintenanceResult = {
    ok: true,
    gsc: null,
    semrush: null,
    websiteJobs: null,
    directoryQueue: now.getUTCDay() === 1 ? null : { skipped: "not Monday UTC" },
    errors: [],
  };
  settled.forEach((result, index) => {
    const task = tasks[index][0] as "gsc" | "semrush" | "websiteJobs" | "directoryQueue";
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
