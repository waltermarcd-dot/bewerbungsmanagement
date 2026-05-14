import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, X, Image as ImageIcon, Check, RotateCcw, ZoomIn } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

const STYLES = [
  {
    id: "casual",
    label: "Casual",
    prompt: "Professional headshot for a resume. Casual smart style, plain light neutral background, friendly expression, even natural lighting, sharp and clear image with no vignette or fade, face fully visible and recognizable. Keep the person's face identical."
  },
  {
    id: "business-casual",
    label: "Business Casual",
    prompt: "Professional headshot for a resume. Business casual attire (e.g. shirt/blouse, no tie), clean plain neutral background, confident expression, even studio lighting, sharp and clear image with no vignette or fade, face fully visible and recognizable. Keep the person's face identical."
  },
  {
    id: "business",
    label: "Business",
    prompt: "Professional headshot for a resume. Formal business attire (suit/blazer, tie if male), clean plain neutral background, warm confident smile, approachable and trustworthy expression like a successful sales manager or business leader, even professional studio lighting, sharp and clear image with no vignette or fade, face fully visible and recognizable. Keep the person's face identical."
  }
];

export default function PhotoUploader({ onPhotoReady, t, startWithCamera = false }) {
  const [preview, setPreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [cameraMode, setCameraMode] = useState(startWithCamera ? "camera" : "file");
  const [isCameraActive, setIsCameraActive] = useState(startWithCamera);
  const [stream, setStream] = useState(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceProgress, setEnhanceProgress] = useState(0);
  const [generatedPhotos, setGeneratedPhotos] = useState(null); // { casual, business-casual, business }
  const [chosen, setChosen] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    if (isCameraActive) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [isCameraActive]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch {
      setCameraMode("file");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
  };

  const fixExifOrientation = (dataUrl) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };
    img.src = dataUrl;
  });

  const startProgress = () => {
    setEnhanceProgress(0);
    let val = 0;
    progressRef.current = setInterval(() => {
      val += Math.random() * 5;
      if (val >= 90) { clearInterval(progressRef.current); val = 90; }
      setEnhanceProgress(Math.min(val, 90));
    }, 600);
  };

  const finishProgress = () => {
    clearInterval(progressRef.current);
    setEnhanceProgress(100);
  };

  const processPhoto = async (url, previewDataUrl) => {
    // isEnhancing and startProgress already called before processPhoto
    try {
      const results = await Promise.all(
        STYLES.map(s => base44.integrations.Core.GenerateImage({ prompt: s.prompt, existing_image_urls: [url] }))
      );
      finishProgress();
      const photos = {};
      STYLES.forEach((s, i) => { photos[s.id] = results[i].url; });
      setGeneratedPhotos(photos);
    } catch {
      finishProgress();
      // Enhancement failed – auto-proceed with original photo
      setGeneratedPhotos(null);
      setIsEnhancing(false);
      onPhotoReady({ preview: previewDataUrl, uploadedUrl: url, generatedPhotos: null, chosenStyle: "original" });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const fixed = await fixExifOrientation(ev.target.result);
      setPreview(fixed);
      setIsEnhancing(true);
      startProgress();
      const blob = await fetch(fixed).then(r => r.blob());
      const { file_url } = await base44.integrations.Core.UploadFile({ file: new File([blob], "photo.jpg", { type: "image/jpeg" }) });
      setUploadedUrl(file_url);
      await processPhoto(file_url, fixed);
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || video.readyState < 2 || video.videoWidth === 0) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    setPreview(dataUrl);
    stopCamera();
    setIsCameraActive(false);
    setIsEnhancing(true);
    startProgress();
    const blob = await fetch(dataUrl).then(r => r.blob());
    const { file_url } = await base44.integrations.Core.UploadFile({ file: new File([blob], "selfie.png", { type: "image/png" }) });
    setUploadedUrl(file_url);
    await processPhoto(file_url, dataUrl);
  };

  const handleChoose = (styleId) => {
    setChosen(styleId);
  };

  const handleConfirm = () => {
    const chosenUrl = chosen === "original" ? preview : generatedPhotos[chosen];
    onPhotoReady({ preview: chosenUrl, uploadedUrl, generatedPhotos, chosenStyle: chosen });
  };

  const clearPhoto = () => {
    setPreview(null); setUploadedUrl(null); setGeneratedPhotos(null);
    setChosen(null); setIsEnhancing(false); setEnhanceProgress(0);
    onPhotoReady(null);
    if (startWithCamera) {
      setCameraMode("camera");
      setIsCameraActive(true);
    } else {
      setCameraMode("file");
      setIsCameraActive(false);
    }
  };

  // No photo yet
  if (!preview) return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-border p-6">

      {cameraMode === "file" ? (
        <label className="flex flex-col items-center gap-3 px-6 py-10 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent/40 hover:bg-accent/5 transition-all">
          <Upload className="w-8 h-8 text-accent" />
          <div className="text-center">
            <span className="text-sm font-medium">{t?.chooseFile || "Foto wählen"}</span>
            <p className="text-xs text-muted-foreground mt-1">{t?.hint || "JPG oder PNG"}</p>
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl border border-border" />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <Button onClick={handleCapture} className="w-full gap-2 rounded-xl">
            <Camera className="w-4 h-4" /> {t?.capture || "Foto aufnehmen"}
          </Button>
        </div>
      )}
    </motion.div>
  );

  // Enhancing
  if (isEnhancing) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="bg-white rounded-xl border border-border p-6 flex flex-col items-center gap-4">

      <img src={preview} alt="Original" className="w-28 h-36 object-cover rounded-lg border border-border" />
      
      <div className="text-center space-y-3 w-full">
        <p className="text-xs text-muted-foreground">Unser Friseur und unser Maskenbildner schauen mal ob sie dich noch schöner machen können</p>
        <p className="text-xl font-semibold text-primary">{Math.round(enhanceProgress)}%</p>
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div className="h-2 bg-primary rounded-full transition-all duration-500" style={{ width: `${enhanceProgress}%` }} />
        </div>
      </div>
    </motion.div>
  );

  // Pick from 3 variants + original
  if (generatedPhotos) return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-border p-6 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Welches Foto möchtest du verwenden?</p>
        <button onClick={clearPhoto} className="text-muted-foreground hover:text-destructive">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Original */}
        <PhotoOption
          label="Original"
          src={preview}
          isChosen={chosen === "original"}
          onClick={() => handleChoose("original")}
        />
        {STYLES.map(s => (
          <PhotoOption
            key={s.id}
            label={s.label}
            src={generatedPhotos[s.id]}
            isChosen={chosen === s.id}
            onClick={() => handleChoose(s.id)}
          />
        ))}
      </div>



      <div className="border-t border-border pt-4 space-y-2">
          <Button onClick={handleConfirm} disabled={!chosen} className="w-full gap-2">
            <Check className="w-4 h-4" /> Dieses Bild nehmen
          </Button>
          <Button variant="ghost" onClick={clearPhoto} className="w-full gap-2 text-muted-foreground">
            <RotateCcw className="w-4 h-4" /> Nochmal probieren
          </Button>
        </div>
    </motion.div>
  );

  return null;
}

function PhotoOption({ label, src, isChosen, onClick }) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="text-center space-y-1.5">
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <img src={src} alt={label} className="max-w-full max-h-full rounded-xl object-contain shadow-2xl" />
          <button className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-1.5 hover:bg-black/70">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <div
        className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${isChosen ? "border-primary" : "border-border hover:border-primary/40"}`}
        onClick={onClick}
      >
        <img src={src} alt={label} className="w-full aspect-[3/4] object-cover" />
        {isChosen && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setZoomed(true); }}
          className="absolute bottom-1.5 right-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
        >
          <ZoomIn className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}