import { SimulationScenario } from '../types';
import { INITIAL_SIMULATION_SCENARIOS } from '../mockData/compliance';
import { apiFetch, simulateDelay } from './apiClient';

export interface StressTestInput {
  baseAnnualSpend: number;
  inflationRateShock: number;
  supplyChainDisruption: number;
  headcountGrowth: number;
  fxVolatilityShock: number;
  contingencyBufferPercent: number;
}

export interface StressTestResult {
  projectedSpend: number;
  projectedDeficit: number;
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  projectedRunRateMonths: number;
  monthlyProjections: {
    month: string;
    baseline: number;
    stressed: number;
    contingencyBurn: number;
  }[];
}

export const simulationService = {
  async getScenarios(): Promise<SimulationScenario[]> {
    await simulateDelay(50);
    return INITIAL_SIMULATION_SCENARIOS;
  },

  async runSimulation(input: StressTestInput): Promise<StressTestResult> {
    try {
      // Fetch projection results from Express backend sandbox
      const data = await apiFetch<{ success: boolean; simulation: any }>('/simulations/run', {
        method: 'POST',
        body: JSON.stringify({
          departmentId: 'ENG-01', // default demo context
          proposedBudget: input.baseAnnualSpend,
          projectedSpent: input.baseAnnualSpend * (1 + (input.inflationRateShock + input.supplyChainDisruption + input.headcountGrowth + input.fxVolatilityShock) / 100),
          simulatedAlerts: ['HIGH_VALUE']
        })
      });
      console.log('Backend simulation projected:', data);
    } catch (e) {
      console.warn('Backend sandbox simulation skipped, falling back to local client math:', e);
    }

    // Mathematical projection model
    const inflationFactor = 1 + input.inflationRateShock / 100;
    const supplyFactor = 1 + (input.supplyChainDisruption / 100) * 0.35;
    const headcountFactor = 1 + (input.headcountGrowth / 100) * 0.45;
    const fxFactor = 1 + (input.fxVolatilityShock / 100) * 0.15;

    const totalMultiplier = inflationFactor * supplyFactor * headcountFactor * fxFactor;
    const projectedSpend = Math.round(input.baseAnnualSpend * totalMultiplier);
    const contingencyAvailable = Math.round((input.baseAnnualSpend * input.contingencyBufferPercent) / 100);
    const projectedDeficit = projectedSpend - (input.baseAnnualSpend + contingencyAvailable);

    let riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (projectedDeficit > 30000000) riskCategory = 'CRITICAL';
    else if (projectedDeficit > 15000000) riskCategory = 'HIGH';
    else if (projectedDeficit > 0) riskCategory = 'MEDIUM';

    const months = ['Q1 Apr', 'Q1 May', 'Q1 Jun', 'Q2 Jul', 'Q2 Aug', 'Q2 Sep', 'Q3 Oct', 'Q3 Nov', 'Q3 Dec', 'Q4 Jan', 'Q4 Feb', 'Q4 Mar'];
    const baseMonthly = input.baseAnnualSpend / 12;

    const monthlyProjections = months.map((month, idx) => {
      const progression = 1 + (idx / 12) * (totalMultiplier - 1);
      return {
        month,
        baseline: Math.round(baseMonthly),
        stressed: Math.round(baseMonthly * progression),
        contingencyBurn: Math.round(contingencyAvailable / 12),
      };
    });

    const projectedRunRateMonths = projectedDeficit > 0 ? Number((12 / totalMultiplier).toFixed(1)) : 12.0;

    return {
      projectedSpend,
      projectedDeficit,
      riskCategory,
      projectedRunRateMonths,
      monthlyProjections,
    };
  },
};
