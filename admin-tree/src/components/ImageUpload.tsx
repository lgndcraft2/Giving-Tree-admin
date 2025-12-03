import React, { useEffect, useRef } from "react";

// 1. Tell TypeScript that window.cloudinary exists
declare global {
  interface Window {
    cloudinary: any;
  }
}

// 2. Add 'currentImage' to the interface
interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  currentImage?: string; // <--- NEW PROP (Optional string)
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadSuccess, currentImage }) => { // <--- Destructure it here
  const cloudinaryRef = useRef<any>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if (window.cloudinary) {
      cloudinaryRef.current = window.cloudinary;

      widgetRef.current = cloudinaryRef.current.createUploadWidget(
        {
          cloudName: "dqsiw99eq", 
          uploadPreset: "Charity_Image", 
          multiple: false,
          folder: "user_profiles",
          clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
          maxImageFileSize: 2000000, 
        },
        function (error: any, result: any) {
          if (!error && result && result.event === "success") {
            console.log("Upload Done:", result.info);
            onUploadSuccess(result.info.secure_url);
          }
        }
      );
    }
  }, [onUploadSuccess]);

  const openWidget = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    } else {
      console.error("Cloudinary widget is not loaded yet");
    }
  };

  return (
    <div className="flex flex-col gap-3">
        {/* Use the prop 'currentImage' instead of formData */}
        {currentImage && (
            <div className="mb-2">
                <img 
                src={currentImage} 
                alt="Current" 
                className="w-20 h-20 object-cover rounded-md border border-gray-200"
                />
            </div>
        )}
      
      <div>
        <button
            type="button"
            onClick={openWidget}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
            Upload Image
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;