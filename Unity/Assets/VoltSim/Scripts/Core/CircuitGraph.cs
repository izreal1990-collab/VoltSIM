using System;
using UnityEngine;

namespace VoltSim.Core.Simulation
{
    [DisallowMultipleComponent]
    public sealed class CircuitGraph : MonoBehaviour
    {
        [SerializeField] private int capacity = 128;
        [SerializeField] private float shortThresholdOhms = .35f;
        [SerializeField] private CircuitNode[] nodes;
        [SerializeField] private CircuitEdge[] edges;
        [SerializeField] private int phaseAIndex, phaseBIndex, neutralIndex, groundIndex;
        private int[] adjacency, queue, visited;
        private int nodeCount, edgeCount, adjacencyCount, visitToken;
        public event Action<CircuitEdge, float> BreakerTripped;
        public event Action<CircuitNode> ArcFlash;
        public event Action<CircuitNode> ShockHazard;
        public int NodeCount => nodeCount;
        public CircuitNode GetNode(int index) => index >= 0 && index < nodeCount ? nodes[index] : null;

        private void Awake()
        {
            capacity = Mathf.Max(16, capacity); nodes = new CircuitNode[capacity]; edges = new CircuitEdge[capacity * 2];
            adjacency = new int[capacity * 4]; queue = new int[capacity]; visited = new int[capacity];
        }
        public int AddNode(CircuitNode node)
        {
            if (node == null || nodeCount == capacity) return -1; nodes[nodeCount] = node; return nodeCount++;
        }
        public int Connect(int from, int to, float resistanceOhms, bool closed = true)
        {
            if (edgeCount == edges.Length || adjacencyCount + 2 > adjacency.Length) return -1;
            CircuitEdge edge = new CircuitEdge(from, to, Mathf.Max(.001f, resistanceOhms), closed); edges[edgeCount] = edge;
            AddAdjacent(from, edgeCount); AddAdjacent(to, edgeCount); return edgeCount++;
        }
        private void AddAdjacent(int node, int edge)
        {
            CircuitNode current = nodes[node];
            if (current.AdjacentCount == 0) current.AdjacentStart = adjacencyCount;
            adjacency[adjacencyCount++] = edge; current.AdjacentCount++;
        }
        public void SetRoots(int phaseA, int phaseB, int neutral, int ground)
        { phaseAIndex = phaseA; phaseBIndex = phaseB; neutralIndex = neutral; groundIndex = ground; }
        public void Evaluate()
        {
            for (int i = 0; i < nodeCount; i++) { nodes[i].FeedType = SourceFeedType.Floating; nodes[i].IsEnergized = false; nodes[i].PotentialRms = 0f; }
            Propagate(phaseAIndex, SourceFeedType.PhaseA, 120f, 0f); Propagate(phaseBIndex, SourceFeedType.PhaseB, 120f, 180f);
            Propagate(neutralIndex, SourceFeedType.Neutral, 0f, 0f); Propagate(groundIndex, SourceFeedType.Ground, 0f, 0f); InspectFaults();
        }
        private void Propagate(int root, SourceFeedType feed, float volts, float phase)
        {
            if (root < 0 || root >= nodeCount) return; int head = 0, tail = 0, token = ++visitToken; queue[tail++] = root; visited[root] = token;
            while (head < tail) { int index = queue[head++]; CircuitNode node = nodes[index]; node.FeedType = feed; node.PotentialRms = volts; node.PhaseDegrees = phase; node.IsEnergized = feed == SourceFeedType.PhaseA || feed == SourceFeedType.PhaseB;
                for (int i = 0; i < node.AdjacentCount; i++) { CircuitEdge edge = edges[adjacency[node.AdjacentStart + i]]; if (!edge.Conducts) continue; int next = edge.From == index ? edge.To : edge.From; if (visited[next] == token) continue; visited[next] = token; queue[tail++] = next; }
            }
        }
        private void InspectFaults()
        {
            for (int i = 0; i < edgeCount; i++) { CircuitEdge edge = edges[i]; if (!edge.Conducts) continue; CircuitNode a = nodes[edge.From], b = nodes[edge.To]; bool hotReturn = (a.IsEnergized && IsReturn(b)) || (b.IsEnergized && IsReturn(a));
                if (hotReturn && edge.ResistanceOhms <= shortThresholdOhms) { float current = 120f / edge.ResistanceOhms; edge.CurrentAmps = current; TripBreaker(current); ArcFlash?.Invoke(a.IsEnergized ? a : b); return; }
                if ((a.IsChassis && a.IsEnergized && !HasGroundBond(edge.From)) || (b.IsChassis && b.IsEnergized && !HasGroundBond(edge.To))) ShockHazard?.Invoke(a.IsChassis ? a : b);
            }
        }
        private static bool IsReturn(CircuitNode node) => node.FeedType == SourceFeedType.Neutral || node.FeedType == SourceFeedType.Ground;
        private bool HasGroundBond(int index) { CircuitNode node = nodes[index]; for (int i = 0; i < node.AdjacentCount; i++) { CircuitEdge edge = edges[adjacency[node.AdjacentStart + i]]; int next = edge.From == index ? edge.To : edge.From; if (nodes[next].FeedType == SourceFeedType.Ground && edge.Conducts) return true; } return false; }
        private void TripBreaker(float faultCurrent) { for (int i = 0; i < edgeCount; i++) if (edges[i].IsBreaker && edges[i].BreakerState == BreakerState.On) { edges[i].BreakerState = BreakerState.Tripped; BreakerTripped?.Invoke(edges[i], faultCurrent); return; } }
        public float MeasureRms(int first, int second)
        {
            CircuitNode a = GetNode(first), b = GetNode(second); if (a == null || b == null) return 0f;
            if (a.IsEnergized && b.IsEnergized && a.FeedType != b.FeedType) return 240f;
            if ((a.IsEnergized && IsReturn(b)) || (b.IsEnergized && IsReturn(a))) return 120f;
            if ((a.IsEnergized && b.FeedType == SourceFeedType.Floating) || (b.IsEnergized && a.FeedType == SourceFeedType.Floating)) return 40f;
            return Mathf.Abs(a.PotentialRms - b.PotentialRms);
        }
        public bool IsLive(int first, int second) => MeasureRms(first, second) > 30f;
        public bool TryResistance(int first, int second, out float resistance) { resistance = first == second ? .1f : 999999f; return first == second; }
    }
}