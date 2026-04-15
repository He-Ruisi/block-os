做一个 React + TypeScript 的完整应用，实现：**摄像头拍照 → Base64 编码 → 调用 PaddleOCR API → 显示并保存识别结果**。上面是可以直接用的 HTML 原型演示。下面是完整的 **React + TypeScript 项目代码**，你可以放进 Vite 项目直接跑：

---

## 核心实现：`CameraOCR.tsx`

```tsx
import { useRef, useState, useCallback } from "react";

const API_URL = "https://lao3t2m4beyceb6c.aistudio-app.com/layout-parsing";
const TOKEN = "74fc1211d4321e9438158dae3d22f8005fd5e4e2";

type Status = "idle" | "camera" | "captured" | "loading" | "done" | "error";

export default function CameraOCR() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [capturedBase64, setCapturedBase64] = useState<string>("");
  const [resultText, setResultText] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // 1. 开启摄像头
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStatus("camera");
    } catch (err) {
      setErrorMsg("无法访问摄像头：" + (err as Error).message);
    }
  }, []);

  // 2. 拍照
  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const base64 = dataUrl.split(",")[1];
    setCapturedBase64(base64);
    setPreviewSrc(dataUrl);
    setStatus("captured");
    // 停止摄像头
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  // 3. 上传图片（替代摄像头）
  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target!.result as string;
      setCapturedBase64(dataUrl.split(",")[1]);
      setPreviewSrc(dataUrl);
      setStatus("captured");
    };
    reader.readAsDataURL(file);
  }, []);

  // 4. 调用 PaddleOCR API
  const runOCR = useCallback(async () => {
    if (!capturedBase64) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const payload = {
        file: capturedBase64,
        fileType: 1, // 图片
        useDocOrientationClassify: false,
        useDocUnwarping: false,
        useChartRecognition: false,
      };
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${TOKEN}`,
        },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const results = data?.result?.layoutParsingResults ?? [];
      const texts: string[] = results
        .map((r: any) => r?.markdown?.text ?? "")
        .filter(Boolean);
      setResultText(texts.join("\n\n---\n\n") || "（未识别到文字）");
      setStatus("done");
    } catch (err) {
      setErrorMsg((err as Error).message);
      setStatus("error");
    }
  }, [capturedBase64]);

  // 5. 保存为 .txt
  const saveResult = () => {
    const blob = new Blob([resultText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ocr_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 16 }}>
      <h2>PaddleOCR 拍照识别</h2>

      {/* 视频预览 */}
      {status === "camera" && (
        <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%" }} />
      )}
      {/* 拍照预览 */}
      {previewSrc && status !== "camera" && (
        <img src={previewSrc} alt="预览" style={{ width: "100%" }} />
      )}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* 操作按钮 */}
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        {status === "idle" && <button onClick={startCamera}>开启摄像头</button>}
        {status === "camera" && <button onClick={capture}>拍照</button>}
        <label>
          <span style={{ cursor: "pointer", textDecoration: "underline" }}>上传图片</span>
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={onFileChange} />
        </label>
        {(status === "captured" || status === "done" || status === "error") && (
          <button onClick={runOCR} disabled={status === "loading"}>
            {status === "loading" ? "识别中..." : "识别文字"}
          </button>
        )}
        {status === "done" && <button onClick={saveResult}>保存 .txt</button>}
      </div>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      {/* 识别结果 */}
      {(status === "done" || status === "error") && (
        <pre style={{
          marginTop: 16,
          padding: 12,
          background: "#f5f5f5",
          borderRadius: 8,
          whiteSpace: "pre-wrap",
          maxHeight: 300,
          overflowY: "auto",
        }}>
          {resultText || "（无内容）"}
        </pre>
      )}
    </div>
  );
}
```

---

## 关键点说明

**摄像头权限**：`getUserMedia` 在 localhost 或 HTTPS 下才能工作，本地开发用 `vite --host` 或直接 localhost 即可。

**Base64 转换流程**：`video → canvas.drawImage → canvas.toDataURL → split(',')[1]` 去掉前缀，得到纯 Base64 传给 API。

**fileType 固定为 1**：图片传 `1`，如果以后想支持 PDF 上传再改成 `0`。

**保存文字**：用 `Blob + URL.createObjectURL` 触发浏览器下载，纯前端无需后端。

**CORS 注意**：如果 API 没有配置允许浏览器跨域请求，直接从浏览器调用会报 CORS 错误。遇到这种情况需要在本地起一个小代理（Vite 的 `server.proxy` 配置几行就够）。