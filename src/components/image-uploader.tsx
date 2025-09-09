import { UploadButton } from "@/utils/uploadthing";

export function ImageUploader() {
  return (
    <UploadButton
      endpoint="imageUploader"
      onClientUploadComplete={(res) => {
        console.log("Files:", res);
        alert("Upload Completed");
      }}
      onUploadError={(error: Error) => {
        alert(`ERROR! ${error.message}`);
      }}
    />
  );
}

export default ImageUploader;


