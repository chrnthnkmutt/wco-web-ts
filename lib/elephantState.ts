export const globalElephantState = {
  elephantPos: [12.876, 101.815] as [number, number],
  threatLevel: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH',
  status: 'Normal Operations'
};

export const updateElephantState = (pos: [number, number], level: 'LOW' | 'MEDIUM' | 'HIGH', status: string) => {
  globalElephantState.elephantPos = pos;
  globalElephantState.threatLevel = level;
  globalElephantState.status = status;
};