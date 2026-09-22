using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using VoltSim.Core.Simulation;
using VoltSim.Inspection;
using VoltSim.Tools;

namespace VoltSim.AI
{
    public sealed class GeminiInstructorManager : MonoBehaviour
    {
        private const string SystemInstruction = "You are a Master Electrician and Apprentice Mentor. Give concise, code-compliant, safety-first training feedback. Never encourage live work or bypassing LOTO, PPE, GFCI, or NEC requirements.";
        [SerializeField] private string apiKey;
        [SerializeField] private string model = "gemini-2.5-flash";
        [SerializeField] private CircuitGraph graph;
        [SerializeField] private InteractiveMultimeter meter;
        [SerializeField] private NECComplianceEngine compliance;
        public event Action<string> ReplyReceived;
        public event Action<string> RequestFailed;
        [Serializable] private sealed class Part { public string text; }
        [Serializable] private sealed class Content { public Part[] parts; }
        [Serializable] private sealed class Request { public Content systemInstruction; public Content[] contents; }
        [Serializable] private sealed class ResponsePart { public string text; }
        [Serializable] private sealed class CandidateContent { public ResponsePart[] parts; }
        [Serializable] private sealed class Candidate { public CandidateContent content; }
        [Serializable] private sealed class Response { public Candidate[] candidates; public ErrorBody error; }
        [Serializable] private sealed class ErrorBody { public string message; }
        public void Ask(string apprenticeQuestion) { if (string.IsNullOrWhiteSpace(apiKey)) { RequestFailed?.Invoke("Gemini API key is not configured."); return; } StartCoroutine(Send(apprenticeQuestion)); }
        private IEnumerator Send(string question)
        {
            string telemetry = "Telemetry: nodes=" + graph.NodeCount + ", meter=" + meter.Display + ", violations=" + compliance.Violations.Count;
            Request body = new Request { systemInstruction = new Content { parts = new[] { new Part { text = SystemInstruction } } }, contents = new[] { new Content { parts = new[] { new Part { text = question + "\n" + telemetry } } } } };
            string url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";
            using (UnityWebRequest request = new UnityWebRequest(url, "POST")) { byte[] payload = System.Text.Encoding.UTF8.GetBytes(JsonUtility.ToJson(body)); request.uploadHandler = new UploadHandlerRaw(payload); request.downloadHandler = new DownloadHandlerBuffer(); request.SetRequestHeader("Content-Type", "application/json"); request.SetRequestHeader("x-goog-api-key", apiKey); yield return request.SendWebRequest(); if (request.result != UnityWebRequest.Result.Success) { RequestFailed?.Invoke(request.error); yield break; } Response response = JsonUtility.FromJson<Response>(request.downloadHandler.text); if (response.error != null) RequestFailed?.Invoke(response.error.message); else if (response.candidates != null && response.candidates.Length > 0 && response.candidates[0].content.parts.Length > 0) ReplyReceived?.Invoke(response.candidates[0].content.parts[0].text); else RequestFailed?.Invoke("Gemini returned no text."); }
        }
    }
}