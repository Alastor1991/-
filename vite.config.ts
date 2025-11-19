
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Fix for Vercel build error: "Cannot find name 'process'"
declare const process: any;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Make env variables available in the client source code via process.env
      'process.env': env
    }
  }
})
