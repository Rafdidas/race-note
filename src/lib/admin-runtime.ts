export type AdminRuntime = {
  canRunScheduleSync: boolean;
  usesMockData: boolean;
};

export function getAdminRuntime(nodeEnv: string | undefined): AdminRuntime {
  const usesMockData = nodeEnv === "development";

  return {
    canRunScheduleSync: !usesMockData,
    usesMockData,
  };
}
