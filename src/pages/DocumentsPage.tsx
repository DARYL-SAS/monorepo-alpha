import { useEffect, useRef, useState } from "react";

interface DocumentInfo {
    _id: string;
    originalName: string;
    mimetype: string;
    path: string;
}

const DocumentsPage = () => {
    const [documents, setDocuments] = useState<DocumentInfo[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loadingDocuments, setLoadingDocuments] = useState(true);
    const [isDragOver, setIsDragOver] = useState(false);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const fetchAllDocuments = async () => {
        try {
            const res = await fetch("/documents");
            const data = await res.json();
            setDocuments(data);
        } catch (err) {
            console.error("Error fetching documents:", err);
        } finally {
            setLoadingDocuments(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            const res = await fetch("/documents/input", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                setDocuments((prev) => [...prev, data]);
                setFile(null);
            } else {
                throw new Error(data.message || "Erreur lors de l'upload du document");
            }
        } catch (err) {
            console.error("erreur upload:", err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm("Es-tu sûr de vouloir supprimer ce document ?");
        if (!confirmed) return;

        try {
            const res = await fetch(`/documents/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (res.ok) {
                setDocuments((prev) => prev.filter((doc) => doc._id !== id));
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
        fetchAllDocuments();
    }, []);

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <h1 style={{ marginBottom: "20px" }}></h1>

            <form onSubmit={handleUpload}>
                <div
                    onClick={() => !file && inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    style={{
                        border: "2px dashed #d1d5db",
                        borderRadius: "8px",
                        padding: "20px",
                        textAlign: "center",
                        backgroundColor: isDragOver ? "#e0f2fe" : "#f9fafb",
                        cursor: file ? "default" : "pointer",
                        marginBottom: "20px",
                        transition: "background-color 0.3s",
                    }}
                >
                    {file ? (
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "#f3f4f6",
                            borderRadius: "8px",
                            padding: "10px 15px",
                            border: "1px solid #d1d5db"
                        }}>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <span style={{ fontSize: "20px", marginRight: "10px", color: "#6b7280" }}>📄</span>
                                <span>{file.name}</span>
                            </div>
                            <button
                                type="button"
                                onClick={removeFile}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "0",
                                }}
                                aria-label="Retirer le fichier"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "24px", height: "24px", color: "#9ca3af" }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <>
                            <div style={{ fontSize: "40px", color: "#9ca3af", marginBottom: "10px" }}></div>
                            <p style={{ fontSize: "16px" }}>
                                Glissez-déposez un fichier ici, ou <span style={{ color: "#3b82f6", textDecoration: "underline" }}>parcourir</span>
                            </p>
                            <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>
                                PDF, Word, Excel jusqu'à 10MB
                            </p>
                        </>
                    )}
                </div>

                <input
                    type="file"
                    ref={inputRef}
                    style={{ display: "none" }}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                />

                <button
                    type="submit"
                    disabled={!file || uploading}
                    style={{
                        width: "100%",
                        padding: "12px 0",
                        backgroundColor: uploading ? "#9ca3af" : "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        cursor: uploading ? "not-allowed" : "pointer",
                        marginBottom: "30px",
                    }}
                >
                    {uploading ? "Téléversement en cours..." : "Téléverser le document"}
                </button>
            </form>

            {loadingDocuments ? (
                <p>Chargement des documents...</p>
            ) : documents.length === 0 ? (
                <p>Aucun document disponible</p>
            ) : (
                <ul>
                    {documents.map((doc) => (
                        <li key={doc._id} style={{ marginBottom: "10px" }}>
                            <a href={`/documents/${doc._id}`} target="_blank" rel="noopener noreferrer">
                                {doc.originalName}
                            </a>
                            <button
                                onClick={() => handleDelete(doc._id)}
                                style={{
                                    marginLeft: "10px",
                                    backgroundColor: "#ef4444",
                                    color: "#fff",
                                    border: "none",
                                    padding: "5px 10px",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                            >
                                Supprimer
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DocumentsPage;
