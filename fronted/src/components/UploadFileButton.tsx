"use client";

import { ChangeEvent, useRef, useState } from "react";

type PreviewData = {
  fileName: string;
  fileType: string;
  sheetName: string;
  rowCount: number;
  columns: string[];
  rows: Record<string, unknown>[];
};

type UploadFileButtonProps = {
  entity: string;
  onFileSelect?: (file: File) => void;
  accept?: string;
  label?: string;
};

export default function UploadFileButton({
  entity,
  onFileSelect,
  accept = ".csv,.xlsx,.xls",
  label = "Upload File",
}: UploadFileButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileName(file.name);
    setError("");
    setSuccess("");
    setPreview(null);
    setLoading(true);

    onFileSelect?.(file);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://localhost:3001/imports/preview",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to preview the uploaded file.",
        );
      }

      setPreview(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to preview the uploaded file.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!preview) {
      return;
    }

    setImporting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:3001/imports/${entity}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rows: preview.rows,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to import the file.",
        );
      }

      if (data.errorCount > 0) {
        const firstError = data.errors?.[0]?.message;

        throw new Error(
          firstError
            ? `Imported ${data.importedCount} row(s), but ${data.errorCount} row(s) had errors. ${firstError}`
            : `Imported ${data.importedCount} row(s), but ${data.errorCount} row(s) had errors.`,
        );
      }

      setSuccess(
        `Successfully imported ${data.importedCount} row${
          data.importedCount !== 1 ? "s" : ""
        }.`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to import the file.",
      );
    } finally {
      setImporting(false);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleClosePreview = () => {
    if (importing) {
      return;
    }

    setPreview(null);
    setError("");
    setSuccess("");
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={handleButtonClick}
          disabled={loading || importing}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>

          {loading
            ? "Uploading..."
            : importing
              ? "Importing..."
              : label}
        </button>

        {fileName && (
          <span className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-300">
            {fileName}
          </span>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
          {success}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Import Preview
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {preview.fileName} • {preview.fileType.toUpperCase()} •{" "}
                  {preview.rowCount} row
                  {preview.rowCount !== 1 ? "s" : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={handleClosePreview}
                disabled={importing}
                className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto p-6">
              {preview.columns.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No columns were found in this file.
                </p>
              ) : (
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {preview.columns.map((column) => (
                        <th
                          key={column}
                          className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {preview.rows
                      .slice(0, 20)
                      .map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {preview.columns.map((column) => (
                            <td
                              key={`${rowIndex}-${column}`}
                              className="border-b border-gray-100 px-4 py-3 text-gray-700 dark:border-gray-800 dark:text-gray-300"
                            >
                              {String(row[column] ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              {preview.rowCount > 20 && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Showing the first 20 rows of {preview.rowCount}.
                  All {preview.rowCount} rows will be imported when you
                  confirm.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClosePreview}
                disabled={importing}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importing || preview.rowCount === 0}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {importing ? "Importing..." : "Confirm Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
