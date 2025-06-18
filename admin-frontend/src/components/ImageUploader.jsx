import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Plus, X, LoaderCircle } from 'lucide-react';

const ImageUploader = ({ onUploadComplete, initialImages = [] }) => {
  const [images, setImages] = useState(initialImages);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);

    const uploadPromises = files.map(async (file) => {
      const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('images-vehicules') // REMPLACEZ PAR LE NOM DE VOTRE BUCKET
        .upload(fileName, file);
      
      if (error) {
        console.error("Erreur d'upload sur Supabase:", error);
        return null;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('images-vehicules') // REMPLACEZ PAR LE NOM DE VOTRE BUCKET
        .getPublicUrl(fileName);
        
      return publicUrl;
    });

    const uploadedUrls = (await Promise.all(uploadPromises)).filter(Boolean);
    const newImages = [...images, ...uploadedUrls];
    setImages(newImages);
    onUploadComplete(newImages); // Informer le formulaire parent
    setIsUploading(false);
  };

  const handleRemoveImage = (urlToRemove) => {
    const newImages = images.filter(url => url !== urlToRemove);
    setImages(newImages);
    onUploadComplete(newImages);
  };

  return (
    <div>
      <label className="label-style">Images du véhicule</label>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-2">
        {images.map((url, index) => (
          <div key={url} className="relative group aspect-w-1 aspect-h-1">
            <img src={url} alt={`Aperçu ${index + 1}`} className="w-full h-full object-cover rounded-md shadow-md" />
            <button
              type="button"
              onClick={() => handleRemoveImage(url)}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
              aria-label="Supprimer l'image"
            >
              <X size={16} />
            </button>
            {index === 0 && (
              <div className="absolute bottom-0 left-0 bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-tr-md rounded-bl-md">
                Principale
              </div>
            )}
          </div>
        ))}
        <label className="flex items-center justify-center w-full h-full aspect-w-1 aspect-h-1 border-2 border-dashed rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <div className="text-center text-slate-500">
            {isUploading ? <LoaderCircle size={24} className="mx-auto animate-spin" /> : <Plus size={24} className="mx-auto" />}
          </div>
          <input
            type="file"
            multiple
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
};

export default ImageUploader;
