import { storage } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

/**
 * Resizes an image file to a maximum dimension while maintaining aspect ratio.
 * @param file The original file.
 * @param maxWidth The maximum width (default 1200px).
 * @param quality The JPEG quality (0-1).
 */
const compressImage = (file: File, maxWidth = 1024, quality = 0.7): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Canvas to Blob failed"));
                    }
                }, 'image/jpeg', quality);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * Automatically compresses images before upload.
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
    if (!file) throw new Error("No file provided");

    let fileToUpload: Blob | File = file;

    // Compress if it's an image
    if (file.type.startsWith('image/')) {
        try {
            console.log(`Original size: ${(file.size / 1024).toFixed(2)} KB`);
            fileToUpload = await compressImage(file);
            console.log(`Compressed size: ${(fileToUpload.size / 1024).toFixed(2)} KB`);
        } catch (error) {
            console.warn("Image compression failed, uploading original.", error);
        }
    }

    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                // Progress
            },
            (error) => {
                console.error("Upload error:", error);
                reject(error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            }
        );
    });
};
