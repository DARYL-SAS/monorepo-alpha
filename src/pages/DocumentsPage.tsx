import { useEffect, useState} from "react";

interface DocumentInfo {
    _id: string;
    originalName: string;
    mimetype: string;
    path: string;
}

const DocumentsPage = () => {
    const [documents, setDocuments] = useState<DocumentInfo[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    
    // récupérer les données
    const fetchAllDocuments = async () => {
        try {
            const res = await fetch("/documents"); // rajouter la fonction get documents
            const data = await res.json();
            setDocuments(data);
        } catch (err) {
            console.error(" Error fetching documents:", err);
        }
    };

    // uploader un document
    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        try {
            const res = await fetch("/documents/input", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                setDocuments((prev) => [...prev, data]); // rajouter le document à la liste
                setFile(null);
            } else {
                throw new Error(data.message || "Erreur lors de l'upload du document");
            }
        } catch (err) {
            console.error("erreur upload:", err);
        } finally {
            setLoading(false);
        }
    };

    // supprimer un document
    const handleDelete = async (id: string) => {
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

    useEffect(() => {
        fetchAllDocuments();
    }, []);

    return (
        <div>
            <h1>Documents</h1>

            <form onSubmit={handleUpload}>
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <button type="submit" disabled={loading}>
                    {loading ? "Ajout..." : "Ajouter"}
                </button>
            </form>

            <ul>
                {documents.map((doc) => (
                    <li key={doc._id}>
                        <a href={`/documents/${doc._id}`} target="_blank" rel="noopener noreferrer">
                            {doc.originalName}
                        </a>
                        <button onClick={() => handleDelete(doc._id)}>Supprimer</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DocumentsPage;