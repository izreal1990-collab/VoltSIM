using System;

namespace VoltSim.Core.Simulation
{
    public enum BreakerState { On, Off, Tripped }

    [Serializable]
    public sealed class CircuitEdge
    {
        public int From;
        public int To;
        public float ResistanceOhms;
        public float Ampacity;
        public bool Closed;
        public bool IsBreaker;
        public BreakerState BreakerState;
        public float CurrentAmps;

        public CircuitEdge(int from, int to, float resistanceOhms, bool closed = true)
        {
            From = from; To = to; ResistanceOhms = resistanceOhms; Closed = closed;
            Ampacity = 20f; BreakerState = BreakerState.On;
        }
        public bool Conducts => Closed && (!IsBreaker || BreakerState == BreakerState.On);
    }
}