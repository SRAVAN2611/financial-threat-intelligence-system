import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Play,
  RotateCcw,
  TrendingDown,
  AlertTriangle,
  Layers,
  Sparkles,
  DollarSign,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { KPICard } from '../components/common/KPICard';
import { ChartCard } from '../components/common/ChartCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { simulationService, StressTestInput, StressTestResult } from '../services/simulationService';
import { SimulationScenario } from '../types';
import { formatCurrency, formatPercent } from '../utils/formatters';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const StressSimulationLab: React.FC = () => {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);

  // Sliders state (in INR ₹)
  const [spend, setSpend] = useState<number>(430000000); // ₹43 Cr
  const [inflation, setInflation] = useState<number>(5.2);
  const [supplyChain, setSupplyChain] = useState<number>(15.0);
  const [headcount, setHeadcount] = useState<number>(10.0);
  const [fxShock, setFxShock] = useState<number>(6.5);
  const [contingency, setContingency] = useState<number>(10.0);

  const [result, setResult] = useState<StressTestResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const loadScenarios = async () => {
    const list = await simulationService.getScenarios();
    setScenarios(list);
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    const input: StressTestInput = {
      baseAnnualSpend: spend,
      inflationRateShock: inflation,
      supplyChainDisruption: supplyChain,
      headcountGrowth: headcount,
      fxVolatilityShock: fxShock,
      contingencyBufferPercent: contingency,
    };
    const res = await simulationService.runSimulation(input);
    setResult(res);
    setIsSimulating(false);
  };

  useEffect(() => {
    loadScenarios();
    runSimulation();
  }, []);

  const handleApplyPreset = (scen: SimulationScenario) => {
    setInflation(scen.inflationRateShock);
    setSupplyChain(scen.supplyChainDisruption);
    setHeadcount(scen.headcountGrowth);
    setFxShock(scen.fxVolatilityShock);
    setContingency(scen.contingencyBufferPercent);
    setTimeout(() => runSimulation(), 100);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Budget Stress & Macroeconomic Shock Simulation Lab"
        subtitle="Dynamic Monte Carlo stress-testing across inflation surges, headcount growth, SaaS/hardware supply chain disruptions, and foreign exchange shocks for FY 2026–27."
        breadcrumbs={[{ label: 'Stress Simulation Lab' }]}
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/30">
            FY 2026–27 MONTE CARLO
          </span>
        }
        actions={
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isSimulating ? 'Recalculating Projections...' : 'Re-Run Stress Simulation'}</span>
          </button>
        }
      />

      {/* Preset Scenario Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {scenarios.map((scen) => (
          <div
            key={scen.id}
            onClick={() => handleApplyPreset(scen)}
            className="enterprise-card p-4 cursor-pointer hover:border-sky-500/50 hover:bg-slate-900/80 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-100">{scen.name}</span>
                <span className="text-[10px] font-mono text-sky-400">Apply Preset</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{scen.description}</p>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] font-mono flex items-center justify-between text-slate-400">
              <span>Inflation: +{scen.inflationRateShock}%</span>
              <span>Supply: +{scen.supplyChainDisruption}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Sliders Controls on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Card */}
        <div className="enterprise-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>Stress Shock Parameters</span>
            </h3>
            <button
              onClick={() => {
                setInflation(5.2);
                setSupplyChain(15.0);
                setHeadcount(10.0);
                setFxShock(6.5);
                setContingency(10.0);
                setTimeout(() => runSimulation(), 50);
              }}
              className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Reset Default
            </button>
          </div>

          {/* Slider 1: Inflation */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Inflation Shock Rate:</span>
              <span className="font-mono font-bold text-sky-400">+{inflation.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              step={0.5}
              value={inflation}
              onChange={(e) => {
                setInflation(Number(e.target.value));
                runSimulation();
              }}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Slider 2: Supply Chain */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">SaaS / GPU Hardware Squeeze:</span>
              <span className="font-mono font-bold text-amber-400">+{supplyChain.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={35}
              step={1}
              value={supplyChain}
              onChange={(e) => {
                setSupplyChain(Number(e.target.value));
                runSimulation();
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Slider 3: Headcount Growth */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Headcount Scaling (% Expansion):</span>
              <span className="font-mono font-bold text-emerald-400">+{headcount.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={headcount}
              onChange={(e) => {
                setHeadcount(Number(e.target.value));
                runSimulation();
              }}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Slider 4: FX Volatility */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Foreign Exchange (FX) Volatility:</span>
              <span className="font-mono font-bold text-indigo-400">+{fxShock.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={0.5}
              value={fxShock}
              onChange={(e) => {
                setFxShock(Number(e.target.value));
                runSimulation();
              }}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Slider 5: Contingency Buffer */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Contingency Capital Buffer:</span>
              <span className="font-mono font-bold text-slate-100">{contingency.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={25}
              step={1}
              value={contingency}
              onChange={(e) => {
                setContingency(Number(e.target.value));
                runSimulation();
              }}
              className="w-full accent-slate-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Right 2 cols: Projections Chart & Risk Outcome */}
        <div className="lg:col-span-2 space-y-4">
          {/* Result Output KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KPICard
              title="Simulated Stressed Spend"
              value={formatCurrency(result?.projectedSpend || 0)}
              subtext="Under simulated shock factors"
              icon={Calendar}
              accentColor="rose"
            />
            <KPICard
              title="Projected Deficit / Gap"
              value={formatCurrency(result?.projectedDeficit || 0)}
              riskBadge={result?.riskCategory || 'HIGH'}
              subtext="Beyond FY 26-27 cap"
              icon={AlertTriangle}
              accentColor="orange"
            />
            <KPICard
              title="Liquidity Runway"
              value={`${result?.projectedRunRateMonths || 12} Months`}
              subtext="Until cap exhaustion"
              icon={Cpu}
              accentColor="emerald"
            />
          </div>

          {/* Dynamic Area Chart */}
          <ChartCard
            title="FY 2026–27 12-Month Simulated Spend: Baseline vs Stressed Run-Rate (₹)"
            subtitle="Dynamic curve showing cumulative monthly burn vs contingency capital absorption"
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={result?.monthlyProjections || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(v) => `₹${(v / 10000000).toFixed(1)} Cr`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }}
                  formatter={(v: any) => formatCurrency(Number(v))}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area
                  type="monotone"
                  dataKey="baseline"
                  stroke="#0284c7"
                  fill="#0284c7"
                  fillOpacity={0.15}
                  name="Baseline Budget Target"
                />
                <Area
                  type="monotone"
                  dataKey="stressed"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.25}
                  name="Stressed Expenditure Curve"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};
