import { useState } from "react";

function CreateSecretPage() {
  const [slug, setSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlug(null);
    const formData = new FormData(e.target as HTMLFormElement);
    const formDataObj = Object.fromEntries(formData.entries());

    try {
      const convertedActiveDays = Number(formDataObj.activeDays);
      if (isNaN(convertedActiveDays)) {
        throw new Error("Active days must be a valid number");
      }

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/secret`,
        {
          method: "POST",
          body: JSON.stringify({
            ...formDataObj,
            activeDays: convertedActiveDays,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create secret");
      }

      const data = await response.json();

      console.log(data);

      if (!data.success) {
        throw new Error(data.errorMessage || "Failed to create secret");
      } else {
        setSlug(data.data.slug);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center flex-col px-2 gap-2">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col p-4 rounded border bg-card w-full max-w-xl"
      >
        {/* Card Header */}
        <span className="text-lg font-medium">Create a sharable secret</span>
        <span className="text-muted-foreground">
          Please input some secret text and you will receive a shareable link.
        </span>

        {/* Link Content */}
        <span className="mt-4">Link content</span>
        <textarea
          name="content"
          className="textarea"
          placeholder="Enter your secret message"
        />

        {/* Link Active Days */}
        <span className="mt-4">Link will be active for</span>
        <div className="flex gap-2 mt-1 items-center">
          <input
            name="activeDays"
            type="number"
            className="input w-12"
            min={1}
            max={365}
            defaultValue={1}
          />
          <span className="text-muted-foreground">days</span>
        </div>

        {/* Link Password */}
        <span className="mt-4">Link password (optional)</span>
        <div className="flex gap-2 mt-1">
          <input
            name="password"
            placeholder="password"
            className="input w-full"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-8 justify-end">
          <button type="submit" className="accent-button">
            Create
          </button>
        </div>

        {/* Display Slug */}
        {slug && (
          <div className="mt-4 p-2 bg-muted rounded">
            <span>
              Your secret link:{" "}
              <a
                href={`${import.meta.env.VITE_PUBLIC_SITE_URL}/share/${slug}`}
                target="_blank"
                className="text-accent"
              >
                {import.meta.env.VITE_PUBLIC_SITE_URL}/share/{slug}
              </a>
            </span>
          </div>
        )}
      </form>

      {error && <span className="text-red-400">Error: {error}</span>}
    </div>
  );
}

export default CreateSecretPage;
