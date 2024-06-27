import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import EnvironmentPlugin from 'vite-plugin-environment'

// List of problematic environment variables
const problematicEnvVars = [
  'CommonProgramFiles(x86)',
  'ProgramFiles(x86)',
  'IntelliJ IDEA Community Edition'
]

// Remove the problematic environment variables
problematicEnvVars.forEach((varName) => {
  delete process.env[varName]
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), EnvironmentPlugin('all')],
  server: {
    host: true,
    port: 3000
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
