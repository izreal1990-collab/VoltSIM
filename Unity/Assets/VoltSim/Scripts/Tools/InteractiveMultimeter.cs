using TMPro;
using UnityEngine;
using VoltSim.Core.Simulation;

namespace VoltSim.Tools
{
    public enum MultimeterMode { Off, AC_Voltage, DC_Voltage, Continuity, Resistance }
    [DisallowMultipleComponent]
    public sealed class InteractiveMultimeter : MonoBehaviour
    {
        [SerializeField] private CircuitGraph graph;
        [SerializeField] private ProbeTip redProbe, blackProbe;
        [SerializeField] private TextMeshPro valueText, unitText;
        [SerializeField] private AudioSource buzzer;
        [SerializeField] private float refreshHz = 12f;
        public MultimeterMode Mode;
        public float LastValue { get; private set; }
        public string Display { get; private set; }
        private float nextRefresh;
        private void Update() { if (Time.unscaledTime >= nextRefresh) { nextRefresh = Time.unscaledTime + 1f / refreshHz; Refresh(); } }
        public void Refresh()
        {
            if (Mode == MultimeterMode.Off) { Set("", "OFF", false); return; }
            int a = redProbe.NodeIndex, b = blackProbe.NodeIndex; if (a < 0 || b < 0) { Set(Mode == MultimeterMode.AC_Voltage ? "0.0" : "O.L", Mode == MultimeterMode.AC_Voltage ? "V AC" : "ohm", false); return; }
            if ((Mode == MultimeterMode.Continuity || Mode == MultimeterMode.Resistance) && graph.IsLive(a, b)) { Set("O.L", "LIVE", false); return; }
            if (Mode == MultimeterMode.AC_Voltage) { LastValue = graph.MeasureRms(a, b); Set(LastValue.ToString("F1"), "V AC", false); return; }
            if (Mode == MultimeterMode.DC_Voltage) { Set("0.002", "V DC", false); return; }
            float ohms; bool bonded = graph.TryResistance(a, b, out ohms); LastValue = ohms; bool tone = bonded && ohms < 30f;
            Set(tone ? ohms.ToString("F1") : "O.L", "ohm", tone);
        }
        private void Set(string value, string unit, bool tone) { Display = value; if (valueText) valueText.SetText(value); if (unitText) unitText.SetText(unit); if (buzzer) { if (tone && !buzzer.isPlaying) buzzer.Play(); else if (!tone && buzzer.isPlaying) buzzer.Stop(); } }
    }

    [RequireComponent(typeof(Collider))]
    public sealed class ProbeTip : MonoBehaviour
    {
        [SerializeField] private CircuitGraph graph;
        public int NodeIndex { get; private set; } = -1;
        private void OnTriggerEnter(Collider other) { TerminalAnchor anchor = other.GetComponent<TerminalAnchor>(); if (anchor == null) return; for (int i = 0; i < graph.NodeCount; i++) if (graph.GetNode(i).Id == anchor.NodeId) { NodeIndex = i; return; } }
        private void OnTriggerExit(Collider other) { if (other.GetComponent<TerminalAnchor>() != null) NodeIndex = -1; }
    }
}