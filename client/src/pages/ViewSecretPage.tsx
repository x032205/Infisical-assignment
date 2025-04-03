// import { Link } from "react-router";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function ViewSecretPage() {
  const { secretId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState<{
    content: string;
    expiresAt: Date;
  } | null>(null);

  // Password handler
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState("");

  // Fetch secret on page load
  const fetchSecret = async (pwd?: string) => {
    try {
      const url = pwd
        ? `${import.meta.env.VITE_PUBLIC_API_URL}/secret/${secretId}?password=${encodeURIComponent(pwd)}`
        : `${import.meta.env.VITE_PUBLIC_API_URL}/secret/${secretId}`;

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Secret not found");
        }
        throw new Error("Failed to fetch secret");
      }

      const data = await response.json();

      if (!data.success) {
        if (data.errorCode === "PASSWORD_REQUIRED") {
          setPasswordRequired(true);
        } else {
          throw new Error(data.errorMessage);
        }
      } else {
        setSecret(data.data);
        setPasswordRequired(false);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecret();
  }, [secretId]);

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchSecret(password);
  };

  return (
    <div className="h-screen flex justify-center items-center flex-col">
      {/* Password input */}
      {passwordRequired && (
        <form
          onSubmit={handleSubmitPassword}
          className="flex flex-col gap-4 w-full max-w-sm mb-2"
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="input"
          />
          <button type="submit" className="accent-button">
            Submit
          </button>
        </form>
      )}

      {/* Loading and error states */}
      {loading && <span className="animate-pulse">Loading...</span>}
      {error && <span className="text-red-400">Error: {error}</span>}

      {!loading && !error && !passwordRequired && secret && (
        <div className="flex flex-col bg-card border rounded py-3 px-4 w-full max-w-lg gap-1">
          <span className="text-muted-foreground text-sm">
            Secret <span className="text-accent">{secretId}</span>
          </span>
          <span>{secret.content}</span>
          <div className="h-px w-full bg-border my-1"></div>
          <span className="text-muted-foreground text-xs font-mono">
            Expires on {new Date(secret.expiresAt).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}

export default ViewSecretPage;
