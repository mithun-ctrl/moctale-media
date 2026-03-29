// Reads the Vercel Blob token from the .env file at build time via Vite.
// import.meta.env.VITE_* variables are inlined by Vite during the build,
// so this works correctly in the browser without any server.

const blobToken = import.meta.env.VITE_BLOB_READ_WRITE_TOKEN

export default blobToken
