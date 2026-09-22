using System;
using UnityEngine;

namespace VoltSim.Core.Simulation
{
    public enum SourceFeedType { PhaseA, PhaseB, Neutral, Ground, Floating }
    public enum TerminalKind { BrassHot, SilverNeutral, GreenGround, Chassis, Generic }

    [Serializable]
    public sealed class CircuitNode
    {
        [SerializeField] private string id;
        public string Id => id;
        public SourceFeedType FeedType;
        public TerminalKind TerminalKind;
        public bool IsChassis;
        public bool IsEnergized;
        public float PotentialRms;
        public float PhaseDegrees;
        public int AdjacentStart;
        public int AdjacentCount;

        public CircuitNode(string nodeId, TerminalKind kind = TerminalKind.Generic)
        {
            id = nodeId; TerminalKind = kind; FeedType = SourceFeedType.Floating;
        }
    }

    [DisallowMultipleComponent]
    public sealed class TerminalAnchor : MonoBehaviour
    {
        [SerializeField] private string nodeId;
        [SerializeField] private TerminalKind terminalKind;
        public string NodeId => nodeId;
        public TerminalKind TerminalKind => terminalKind;
    }
}