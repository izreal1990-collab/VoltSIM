using System.Collections.Generic;
using UnityEngine;
using VoltSim.Core.Simulation;

namespace VoltSim.Inspection
{
    public enum ViolationSeverity { Warning, CodeViolation, CriticalHazard }
    public struct CodeViolation { public string Article, Message; public ViolationSeverity Severity; }
    public sealed class NECComplianceEngine : MonoBehaviour
    {
        private readonly List<CodeViolation> violations = new List<CodeViolation>(8);
        public IReadOnlyList<CodeViolation> Violations => violations;
        public void Audit(TerminalKind conductorTerminal, SourceFeedType conductor, int awg, int breakerAmps, int currentCarryingConductors, float boxVolume, bool kitchenCountertop, bool gfci, float torque, float requiredTorque)
        {
            violations.Clear();
            if ((conductor == SourceFeedType.Neutral && conductorTerminal != TerminalKind.SilverNeutral) || ((conductor == SourceFeedType.PhaseA || conductor == SourceFeedType.PhaseB) && conductorTerminal != TerminalKind.BrassHot) || (conductor == SourceFeedType.Ground && conductorTerminal != TerminalKind.GreenGround)) Add("406.4(D)", "Terminal polarity is incorrect.", ViolationSeverity.CriticalHazard);
            int maximum = awg == 14 ? 15 : awg == 12 ? 20 : awg == 10 ? 30 : awg == 8 ? 50 : 0; if (maximum == 0 || breakerAmps > maximum) Add("240.4(D)", "Conductor ampacity does not match breaker rating.", ViolationSeverity.CodeViolation);
            float allowance = awg == 14 ? 2f : awg == 12 ? 2.25f : awg == 10 ? 2.5f : awg == 8 ? 3f : 5f; if (currentCarryingConductors * allowance > boxVolume) Add("314.16", "Box fill volume is exceeded.", ViolationSeverity.CodeViolation);
            if (kitchenCountertop && !gfci) Add("210.8(A)", "Kitchen countertop receptacle requires GFCI protection.", ViolationSeverity.CriticalHazard);
            if (torque < requiredTorque) Add("110.14(D)", "Terminal torque is below manufacturer specification.", ViolationSeverity.Warning);
        }
        private void Add(string article, string message, ViolationSeverity severity) { violations.Add(new CodeViolation { Article = article, Message = message, Severity = severity }); }
    }
}