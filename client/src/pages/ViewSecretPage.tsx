// import { Link } from "react-router";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function ViewSecretPage() {
  const { secretId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState<{ secretId: string } | null>(null);

  // Fetch secret on page load
  useEffect(() => {
    const fetchSecret = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/secret/${secretId}`,
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Secret not found");
          }
          throw new Error("Failed to fetch secret");
        }

        const data = await response.json();

        setSecret(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSecret();
  }, [secretId]);

  return (
    <div className="h-screen flex justify-center items-center flex-col space-x-4">
      {/* Loading and error states */}
      {loading && <span className="animate-pulse">Loading...</span>}
      {error && <span>Error: {error}</span>}

      {!loading && !error && secret && <span>{JSON.stringify(secret)}</span>}
    </div>
  );
}

export default ViewSecretPage;
