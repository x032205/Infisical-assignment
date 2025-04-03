function CreateSecretPage() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const formDataObj = Object.fromEntries(formData.entries());

    const convertedActiveDays = Number(formDataObj.activeDays);
    if (isNaN(convertedActiveDays)) {
      // TODO: Swap to less intrusive error
      throw new Error("Active days must be a valid number");
    }

    // TODO: More client-side input validation

    const response = await fetch("http://localhost:8000/create-link", {
      method: "POST",
      body: JSON.stringify({ ...formDataObj, activeDays: convertedActiveDays }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    console.log(result);
  };

  return (
    <div className="h-screen flex justify-center items-center flex-col px-2">
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
      </form>
    </div>
  );
}

export default CreateSecretPage;
