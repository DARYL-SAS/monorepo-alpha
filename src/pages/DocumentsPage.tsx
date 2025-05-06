import { useEffect, useRef, useState } from "react";

interface DocumentInfo {
    name: string;
    url: string;
    size: Float32Array;
}

const DocumentsPage = () => {
    const [documents, setDocuments] = useState<DocumentInfo[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loadingDocuments, setLoadingDocuments] = useState(true);
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string>("");

    const inputRef = useRef<HTMLInputElement | null>(null);

   

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            const res = await fetch("http://localhost:3000/document/input", {  // Update URL to include the correct port
                method: "POST",
                body: formData,
            });

            const contentType = res.headers.get("Content-Type");
            const isJson = contentType && contentType.includes("application/json");

            const data = isJson ? await res.json() : null;

            if (!res.ok) {
                throw new Error(data.message || "Erreur lors de l'upload du document");
            }

            setDocuments((prev) => [...prev, data]);
            setFile(null);
        } catch (err) {
            console.error("erreur upload:", err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (name: string) => {
        const confirmed = window.confirm("Es-tu sûr de vouloir supprimer ce document ?");
        if (!confirmed) return;

        try {
            const res = await fetch(`/documents/${name}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (res.ok) {
                setDocuments((prev) => prev.filter((doc) => doc.name !== name));
            } else {
                throw new Error(data.message || "Erreur lors de la suppression du document");
            }
        } catch (err) {
            console.error("erreur delete :", err);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const removeFile = () => {
        setFile(null);
    };

    useEffect(() => {
        const fetchAllDocuments = async () => {
            try {
                const res = await fetch('http://localhost:3000/document/read');  // Assure-toi que l'URL de l'API est correcte
                const text = await res.text();
                console.log("Réponse de l'API:", text);  // Debug : Afficher la réponse brute de l'API
    
                const files = JSON.parse(text);
                console.log("Documents récupérés:", files);  // Debug : Vérifier la liste des fichiers
    
                setDocuments(files);  // Mettre à jour l'état avec les documents récupérés
            } catch (err) {
                console.error('Erreur chargement fichiers :', err);
                setError("Erreur lors du chargement des documents");  // Afficher un message d'erreur en cas d'échec
            } finally {
                setLoadingDocuments(false);  // Marquer le chargement comme terminé
            }
        };
    
        fetchAllDocuments();
    }, []); // Effect qui s'exécute une fois lors du montage du composant

    return (
        <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-100">
            <div className="max-w-3xl mx-auto p-5">
                <form onSubmit={handleUpload}>
                    <div
                        onClick={() => !file && inputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors ${
                            isDragOver ? "bg-indigo-600" : "bg-white"
                        } ${file ? "cursor-default" : "cursor-pointer"} mb-5`}
                    >
                        {file ? (
                            <div className="flex items-center justify-between bg-gray-200 rounded-lg p-3 border border-gray-300">
                                <div className="flex items-center">
                                    <span className="text-xl mr-2 text-gray-500">📄</span>
                                    <span>{file.name}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={removeFile}
                                    className="bg-none border-none cursor-pointer p-0"
                                    aria-label="Retirer le fichier"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="text-4xl text-gray-400 mb-2"> </div>
                                <p className="text-lg">
                                    Glissez-déposez un fichier ici, ou {" "}
                                    <span className="text-blue-500 underline">parcourir</span>
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    PDF, Word, Excel jusqu'à 10MB
                                </p>
                            </>
                        )}
                    </div>

                    <input
                        type="file"
                        ref={inputRef}
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />

                    <button
                        type="submit"
                        disabled={!file || uploading}
                        className={`w-full py-3 text-white font-bold rounded-lg mb-7 ${
                            uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {uploading ? "Téléversement en cours..." : "Téléverser le document"}
                    </button>
                </form>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                {loadingDocuments ? (
                    <p>Chargement des documents...</p>
                ) : documents.length === 0 ? (
                    <p>Aucun document disponible</p>
                ) : (
                    <ul>
                        {documents.map((doc) => {

                            console.log("Nom du document", doc.name); // debug

                            return(
                            <li key={doc.name} style={{ marginBottom: "10px" }}>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                    {doc.name}
                                </a>
                                <button
                                    onClick={() => handleDelete(doc.name)}
                                    className="ml-3 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                >
                                    Supprimer
                                </button>
                            </li>
                        );
    })}
                    </ul>
                )}
            </div>
        </div>
    );
};


export default DocumentsPage;
