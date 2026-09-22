using UnityEngine;

namespace VoltSim.Physics
{
    [RequireComponent(typeof(MeshFilter), typeof(MeshRenderer))]
    public sealed class VerletWireSpline : MonoBehaviour
    {
        [SerializeField, Range(12, 16)] private int particleCount = 14;
        [SerializeField] private Transform startAnchor, endAnchor;
        [SerializeField] private float radius = .004f, damping = .985f, gravity = -9.81f;
        [SerializeField] private int constraintIterations = 3;
        private const int RadialSegments = 6;
        private Vector3[] position, previous, vertices, normals; private Vector2[] uv; private int[] triangles; private Mesh mesh;
        private void Awake() { particleCount = Mathf.Clamp(particleCount, 12, 16); position = new Vector3[particleCount]; previous = new Vector3[particleCount]; int rings = particleCount * (RadialSegments + 1); vertices = new Vector3[rings]; normals = new Vector3[rings]; uv = new Vector2[rings]; triangles = new int[(particleCount - 1) * RadialSegments * 6]; mesh = new Mesh { name = "VoltSimWire" }; mesh.MarkDynamic(); GetComponent<MeshFilter>().sharedMesh = mesh; BuildIndices(); ResetWire(); }
        public void ResetWire() { Vector3 a = startAnchor.position, b = endAnchor.position; for (int i = 0; i < particleCount; i++) previous[i] = position[i] = Vector3.Lerp(a, b, i / (float)(particleCount - 1)); }
        private void LateUpdate() { float dt = Mathf.Min(Time.deltaTime, .033f); Vector3 acceleration = Vector3.up * gravity * dt * dt; for (int i = 1; i < particleCount - 1; i++) { Vector3 now = position[i]; position[i] += (position[i] - previous[i]) * damping + acceleration; previous[i] = now; } for (int iteration = 0; iteration < constraintIterations; iteration++) Constrain(); BuildMesh(); }
        private void Constrain() { position[0] = startAnchor.position; position[particleCount - 1] = endAnchor.position; float rest = Vector3.Distance(startAnchor.position, endAnchor.position) / (particleCount - 1); for (int i = 0; i < particleCount - 1; i++) { Vector3 delta = position[i + 1] - position[i]; float length = delta.magnitude; if (length < .0001f) continue; Vector3 correction = delta * ((length - rest) / length * .5f); if (i > 0) position[i] += correction; if (i + 1 < particleCount - 1) position[i + 1] -= correction; } }
        private void BuildIndices() { int t = 0; for (int i = 0; i < particleCount - 1; i++) for (int j = 0; j < RadialSegments; j++) { int a = i * 7 + j, b = a + 7; triangles[t++] = a; triangles[t++] = b; triangles[t++] = b + 1; triangles[t++] = a; triangles[t++] = b + 1; triangles[t++] = a + 1; } mesh.triangles = triangles; }
        private void BuildMesh() { int v = 0; for (int i = 0; i < particleCount; i++) { Vector3 tangent = (i == particleCount - 1 ? position[i] - position[i - 1] : position[i + 1] - position[i]).normalized; Vector3 right = Vector3.Cross(tangent, Vector3.up); if (right.sqrMagnitude < .001f) right = Vector3.right; right.Normalize(); Vector3 up = Vector3.Cross(right, tangent); for (int j = 0; j <= RadialSegments; j++) { float angle = j * Mathf.PI * 2f / RadialSegments; Vector3 normal = right * Mathf.Cos(angle) + up * Mathf.Sin(angle); vertices[v] = transform.InverseTransformPoint(position[i] + normal * radius); normals[v] = normal; uv[v++] = new Vector2(j / (float)RadialSegments, i / (float)(particleCount - 1)); } } mesh.vertices = vertices; mesh.normals = normals; mesh.uv = uv; mesh.RecalculateBounds(); }
        public bool Fasten(float appliedTorqueInLbs, float requiredTorqueInLbs) => appliedTorqueInLbs >= requiredTorqueInLbs;
        public void TriggerHazard(ParticleSystem sparks) { if (sparks) sparks.Play(); Handheld.Vibrate(); }
    }
}